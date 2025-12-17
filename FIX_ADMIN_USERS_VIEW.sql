-- =====================================================
-- FIX: Admin Panel Cannot See Registered Users
-- =====================================================
-- This script creates the required database function and 
-- policies to allow admins to view all registered users
-- with their email addresses.
-- =====================================================

-- STEP 1: Drop existing function (required when changing return type)
DROP FUNCTION IF EXISTS public.get_all_user_profiles();

-- STEP 2: Create the RPC function to get all user profiles with emails
-- This function joins user_profiles with auth.users to get email addresses
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
        AND (
            user_profiles.role = 'admin' 
            OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE auth.users.id = auth.uid()) = 'admin'
        )
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

-- STEP 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_user_profiles() TO authenticated;

-- STEP 3: Ensure admins can view all profiles
-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT
    USING (
        auth.uid() = id 
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
    );

-- =====================================================
-- VERIFICATION: Run this to test the function
-- =====================================================
-- SELECT * FROM get_all_user_profiles();
