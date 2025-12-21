# Fix: New Users Not Migrating to user_profiles Table

## Problem Summary

New users signing up are only being created in `auth.users` but NOT in the `user_profiles` table. This causes:
- ❌ Users unable to update their profile
- ❌ Users not showing in Admin panel
- ❌ Google OAuth users have incomplete profiles
- ❌ Manual profile creation in signup code fails

## Root Causes

1. **No Database Trigger**: There's no automatic trigger to create `user_profiles` entries when users sign up
2. **RLS Policy Issues**: Row Level Security policies are preventing profile creation/updates
3. **Manual Insert Fails**: The frontend code tries to manually insert profiles, but this fails due to RLS
4. **Google OAuth Gap**: Google sign-ins bypass the signup form entirely

---

## ✅ SOLUTION: Run This SQL in Supabase

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Create a new query

### Step 2: Copy & Run the SQL Below

```sql
-- =====================================================
-- FIX: New Users Not Migrating to user_profiles Table
-- =====================================================
-- This creates an automatic trigger that syncs all new
-- users from auth.users to user_profiles
-- =====================================================

-- STEP 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Create the trigger (runs after each new user signs up)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Sync existing orphan users (stuck in auth.users only)
INSERT INTO public.user_profiles (id, full_name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    'user'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Fix RLS policies to allow profile updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- STEP 5: Allow users to insert their profile (backup method)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- STEP 6: Allow users to view profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT
    USING (true);

-- =====================================================
-- ✅ DONE! 
-- =====================================================
```

### Step 3: Click **Run** (or press F5)

### Step 4: Verify It Worked

Run this to check your synced users:
```sql
SELECT * FROM public.user_profiles ORDER BY created_at DESC;
```

You should now see all your users!

---

## What This Does

### 1. **Automatic Trigger** 
- Every time a new user signs up (email OR Google OAuth), the database automatically creates a matching entry in `user_profiles`
- Works in the background - no frontend code needed

### 2. **Syncs Existing Users**
- Copies ALL users currently stuck in `auth.users` to `user_profiles`
- Includes users who signed up via Google OAuth

### 3. **Fixes Profile Updates**
- Updates RLS (Row Level Security) policies
- Users can now update their own profile information

---

## Testing

### Test 1: New Signup
1. Create a new account via email signup
2. Check the database:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'newuser@example.com';
   ```
3. ✅ Should appear immediately

### Test 2: Google OAuth
1. Sign up/login with Google
2. Check the database:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'googleuser@gmail.com';
   ```
3. ✅ Should appear immediately

### Test 3: Profile Update
1. Login to your app
2. Go to Profile page
3. Update your details (mobile, department, year)
4. Click Save
5. ✅ Should save successfully without errors

---

## Alternative: Use Existing Script

You can also run the **[FIX_NEW_USER_MIGRATION.sql](FIX_NEW_USER_MIGRATION.sql)** file in this folder - it contains the same fix.

---

## After Running This

✅ New users will automatically sync to `user_profiles`  
✅ Google OAuth users will have profiles created  
✅ Profile updates will work  
✅ Admin panel will show all users  
✅ No more "orphan" users stuck in auth.users  

**No frontend code changes needed!** The trigger handles everything automatically.
