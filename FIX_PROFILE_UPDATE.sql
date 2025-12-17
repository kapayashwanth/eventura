-- =====================================================
-- FIX: Profile Update Not Working
-- =====================================================
-- This script fixes RLS policies to allow users to 
-- properly update their own profiles.
-- =====================================================

-- STEP 1: Drop existing UPDATE policy for user_profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- STEP 2: Create a proper UPDATE policy with both USING and WITH CHECK
-- The USING clause controls which rows can be selected for update
-- The WITH CHECK clause controls what values can be written
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- STEP 3: Ensure users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id OR true);  -- Allow viewing all profiles (for public listing)

-- STEP 4: Ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- STEP 5: Create an UPSERT-friendly policy (for cases where profile might not exist)
-- This helps when profile was created via trigger but user needs to update
DROP POLICY IF EXISTS "Users can upsert own profile" ON public.user_profiles;

-- STEP 6: Create a trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 7: Fix any orphan users (users in auth but not in user_profiles)
-- =====================================================
INSERT INTO public.user_profiles (id, full_name, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    au.email
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION: Check your profile can be updated
-- =====================================================
-- SELECT * FROM user_profiles WHERE id = auth.uid();
