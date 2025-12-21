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
-- PART 6: USER-SELECTED "APPLIED" EVENTS WITH EMAIL REMINDERS
-- =====================================================
-- Users manually mark events as "Applied" to receive reminders
-- This gives users full control over which events they track

-- Create event applications table (user manually selects)
CREATE TABLE IF NOT EXISTS public.event_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    is_applied BOOLEAN DEFAULT TRUE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_applications_event_id ON public.event_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_applications_user_id ON public.event_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_applications_reminder ON public.event_applications(is_applied, reminder_sent) 
WHERE is_applied = TRUE AND reminder_sent = FALSE;

-- Add application deadline to events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'application_deadline'
    ) THEN
        ALTER TABLE public.events ADD COLUMN application_deadline TIMESTAMPTZ;
        UPDATE public.events SET application_deadline = event_date WHERE application_deadline IS NULL;
    END IF;
END $$;

-- Enable RLS on event_applications
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users control their own applied events
DROP POLICY IF EXISTS "Users can view all applications" ON public.event_applications;
CREATE POLICY "Users can view all applications" ON public.event_applications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own applications" ON public.event_applications;
CREATE POLICY "Users can manage own applications" ON public.event_applications
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function to toggle "Applied" status (user marks event as applied)
CREATE OR REPLACE FUNCTION public.toggle_event_application(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_existing event_applications%ROWTYPE;
    v_new_status BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', FALSE, 'message', 'You must be logged in');
    END IF;
    
    -- Check if already applied
    SELECT * INTO v_existing 
    FROM public.event_applications 
    WHERE event_id = p_event_id AND user_id = v_user_id;
    
    IF FOUND THEN
        -- Toggle the applied status
        v_new_status := NOT v_existing.is_applied;
        
        UPDATE public.event_applications 
        SET 
            is_applied = v_new_status,
            updated_at = NOW(),
            reminder_sent = FALSE  -- Reset reminder flag if re-applying
        WHERE event_id = p_event_id AND user_id = v_user_id;
        
        RETURN json_build_object(
            'success', TRUE, 
            'is_applied', v_new_status,
            'message', CASE WHEN v_new_status THEN 'Marked as applied! You will receive reminder emails.' ELSE 'Removed from applied events' END
        );
    ELSE
        -- First time marking as applied
        INSERT INTO public.event_applications (event_id, user_id, is_applied)
        VALUES (p_event_id, v_user_id, TRUE);
        
        RETURN json_build_object(
            'success', TRUE, 
            'is_applied', TRUE,
            'message', 'Marked as applied! You will receive reminder emails 1 day before the deadline.'
        );
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_event_application(UUID) TO authenticated;

-- Function to check if user marked event as applied
CREATE OR REPLACE FUNCTION public.check_event_application_status(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_application event_applications%ROWTYPE;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('is_applied', FALSE);
    END IF;
    
    SELECT * INTO v_application 
    FROM public.event_applications 
    WHERE event_id = p_event_id AND user_id = v_user_id;
    
    IF FOUND AND v_application.is_applied THEN
        RETURN json_build_object(
            'is_applied', TRUE, 
            'applied_at', v_application.applied_at,
            'reminder_sent', v_application.reminder_sent
        );
    ELSE
        RETURN json_build_object('is_applied', FALSE);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_event_application_status(UUID) TO authenticated;

-- Function to get users who need reminders (for edge function)
DROP FUNCTION IF EXISTS public.get_users_needing_event_reminders();
CREATE FUNCTION public.get_users_needing_event_reminders()
RETURNS TABLE (
    application_id UUID,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    event_id UUID,
    event_title TEXT,
    event_date TIMESTAMPTZ,
    application_deadline TIMESTAMPTZ,
    event_location TEXT,
    event_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.id as application_id,
        ea.user_id,
        up.email as user_email,
        up.full_name as user_name,
        e.id as event_id,
        e.title as event_title,
        e.event_date,
        e.application_deadline,
        e.location as event_location,
        e.description as event_description
    FROM public.event_applications ea
    JOIN public.user_profiles up ON ea.user_id = up.id
    JOIN public.events e ON ea.event_id = e.id
    WHERE 
        ea.is_applied = TRUE
        AND ea.reminder_sent = FALSE
        AND e.application_deadline IS NOT NULL
        AND e.application_deadline > NOW()
        AND e.application_deadline <= NOW() + INTERVAL '25 hours'
        AND e.application_deadline >= NOW() + INTERVAL '23 hours'
    ORDER BY e.application_deadline ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_needing_event_reminders() TO service_role;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION public.mark_reminder_sent(p_application_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.event_applications
    SET 
        reminder_sent = TRUE,
        reminder_sent_at = NOW(),
        updated_at = NOW()
    WHERE id = p_application_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_reminder_sent(UUID) TO service_role;

-- =====================================================
-- SUCCESS! 
-- =====================================================
-- Completed:
-- 1. ✅ User profiles auto-sync from auth
-- 2. ✅ Profile updates work
-- 3. ✅ Admin panel shows all users
-- 4. ✅ User-controlled "Applied" event tracking
-- 5. ✅ Email reminders for applied events (1 day before deadline)
-- 
-- HOW IT WORKS:
-- - Users click "Mark as Applied" on any event
-- - System tracks which events user is interested in
-- - Sends automatic reminder emails 24 hours before deadline
-- - Users can remove "Applied" status anytime
-- 
-- Next: See SETUP_EVENT_REMINDERS.md for email setup
-- =====================================================
