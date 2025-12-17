-- =====================================================
-- QUICK FIX: Users Permission for Admin Panel
-- =====================================================
-- This is an alias file that references QUICK_FIX_ALL.sql
-- Run the QUICK_FIX_ALL.sql file for the complete fix.
-- =====================================================

-- STEP 1: Add email column if it doesn't exist (must be first!)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- STEP 2: Add role column if it doesn't exist
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- STEP 3: Sync ALL users from auth.users to user_profiles
INSERT INTO public.user_profiles (id, full_name, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- STEP 4: Update email for existing profiles that have NULL email
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id AND up.email IS NULL;

-- Drop existing function first (required when changing return type)
DROP FUNCTION IF EXISTS public.get_all_user_profiles();

-- Create function to get all users with emails (admin only)
CREATE OR REPLACE FUNCTION public.get_all_user_profiles()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    mobile_number TEXT,
    department TEXT,
    year_of_study TEXT,
    profile_image TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ,
    email TEXT,
    last_sign_in TIMESTAMPTZ,
    email_confirmed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    ) AND NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.mobile_number,
        up.department,
        up.year_of_study,
        up.profile_image,
        up.bio,
        up.created_at,
        au.email,
        au.last_sign_in_at as last_sign_in,
        au.email_confirmed_at IS NOT NULL as email_confirmed
    FROM public.user_profiles up
    LEFT JOIN auth.users au ON up.id = au.id
    ORDER BY up.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_user_profiles() TO authenticated;

-- Ensure view policy exists
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT
    USING (true);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
