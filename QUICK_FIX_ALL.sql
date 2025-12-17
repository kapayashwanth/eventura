-- =====================================================
-- QUICK FIX: All-in-One Solution
-- =====================================================
-- Run this SINGLE script in Supabase SQL Editor to fix:
-- 1. Admin Panel - Cannot see registered users
-- 2. Profile Page - Cannot update user details
-- =====================================================

-- =====================================================
-- PART 1: FIX PROFILE UPDATE ISSUES
-- =====================================================

-- Drop and recreate UPDATE policy with proper permissions
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ensure users can view profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT
    USING (true);

-- Ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- PART 2: CREATE TRIGGER FOR AUTO PROFILE CREATION
-- =====================================================

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 3: FIX ADMIN USERS VIEW
-- =====================================================

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
    -- Check if the calling user is an admin (via profile role OR user metadata)
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

-- =====================================================
-- PART 4: SYNC EXISTING USERS
-- =====================================================

-- Create profiles for any users who don't have one
INSERT INTO public.user_profiles (id, full_name, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 5: ADD EMAIL COLUMN IF MISSING
-- =====================================================

-- Add email column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Add role column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- =====================================================
-- SUCCESS! 
-- Refresh your app and test:
-- 1. Admin Panel → Registered Users should now work
-- 2. Profile Page → Update details should now save
-- =====================================================
