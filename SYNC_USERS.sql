-- =====================================================
-- SYNC USERS: Copy all users from auth to user_profiles
-- =====================================================

-- Add email column if it doesn't exist
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add role column if it doesn't exist  
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Copy ALL users from auth.users to user_profiles
INSERT INTO public.user_profiles (id, full_name, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- Done! Check your user_profiles table now.
SELECT * FROM public.user_profiles;
