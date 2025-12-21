-- =====================================================
-- EMAIL NOTIFICATIONS & GOOGLE CALENDAR INTEGRATION
-- =====================================================
-- This script sets up:
-- 1. Email when user marks event as applied (+ Google Calendar)
-- 2. Reminder email 1 day before application deadline
-- =====================================================

-- =====================================================
-- PART 1: Update toggle_event_application to trigger email
-- =====================================================

CREATE OR REPLACE FUNCTION public.toggle_event_application(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_existing_app RECORD;
    v_event RECORD;
    v_is_now_applied BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'User not authenticated'
        );
    END IF;

    -- Get event details
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
    
    IF v_event IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Event not found'
        );
    END IF;

    -- Check if application deadline has passed
    IF v_event.application_deadline IS NOT NULL AND v_event.application_deadline < NOW() THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Application deadline has passed'
        );
    END IF;

    -- Check if application exists
    SELECT * INTO v_existing_app 
    FROM public.event_applications 
    WHERE event_id = p_event_id AND user_id = v_user_id;

    IF v_existing_app IS NULL THEN
        -- Create new application
        INSERT INTO public.event_applications (
            event_id,
            user_id,
            is_applied,
            applied_at
        ) VALUES (
            p_event_id,
            v_user_id,
            true,
            NOW()
        );
        
        v_is_now_applied := true;

        -- Trigger email notification (async - won't block if fails)
        PERFORM net.http_post(
            url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-application-confirmation',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
            ),
            body := jsonb_build_object(
                'user_id', v_user_id,
                'event_id', p_event_id
            )
        );

    ELSE
        -- Toggle existing application
        UPDATE public.event_applications
        SET is_applied = NOT v_existing_app.is_applied,
            applied_at = CASE 
                WHEN NOT v_existing_app.is_applied THEN NOW() 
                ELSE applied_at 
            END
        WHERE event_id = p_event_id AND user_id = v_user_id;

        v_is_now_applied := NOT v_existing_app.is_applied;

        -- Send confirmation email only when marking as applied
        IF v_is_now_applied THEN
            PERFORM net.http_post(
                url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-application-confirmation',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
                ),
                body := jsonb_build_object(
                    'user_id', v_user_id,
                    'event_id', p_event_id
                )
            );
        END IF;
    END IF;

    RETURN json_build_object(
        'success', true,
        'is_applied', v_is_now_applied,
        'message', CASE 
            WHEN v_is_now_applied THEN 'Marked as applied! Check your email for confirmation and calendar link.'
            ELSE 'Removed from applied events'
        END
    );
END;
$$;

-- =====================================================
-- PART 2: Function to get users needing deadline reminders
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_users_needing_deadline_reminders()
RETURNS TABLE (
    application_id UUID,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    event_id UUID,
    event_title TEXT,
    event_date TIMESTAMPTZ,
    event_description TEXT,
    event_location TEXT,
    event_category TEXT,
    application_deadline TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.id as application_id,
        up.id as user_id,
        COALESCE((SELECT email FROM auth.users WHERE id = up.id), up.email) as user_email,
        up.full_name as user_name,
        e.id as event_id,
        e.title as event_title,
        e.event_date,
        e.description as event_description,
        e.location as event_location,
        e.category as event_category,
        e.application_deadline
    FROM public.event_applications ea
    INNER JOIN public.user_profiles up ON ea.user_id = up.id
    INNER JOIN public.events e ON ea.event_id = e.id
    WHERE ea.is_applied = true
        AND ea.reminder_sent = false
        AND e.application_deadline IS NOT NULL
        AND e.application_deadline > NOW()
        -- Send reminder 1 day before deadline (with 2-hour window)
        AND e.application_deadline <= NOW() + INTERVAL '25 hours'
        AND e.application_deadline >= NOW() + INTERVAL '23 hours'
    ORDER BY e.application_deadline ASC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_users_needing_deadline_reminders() TO service_role;

-- =====================================================
-- PART 3: Function to mark reminder as sent
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_deadline_reminder_sent(p_application_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.event_applications
    SET reminder_sent = true,
        updated_at = NOW()
    WHERE id = p_application_id;
    
    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_deadline_reminder_sent(UUID) TO service_role;

-- =====================================================
-- PART 4: Set up Supabase settings for HTTP calls
-- =====================================================

-- Store Supabase URL and anon key as database settings
-- Replace these with your actual values from Supabase Dashboard
-- Run these individually after updating the values:

/*
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_anon_key = 'your-anon-key-here';
*/

-- Note: The above ALTER DATABASE commands need to be run with actual values
-- Get these from: Supabase Dashboard > Settings > API

-- =====================================================
-- PART 5: Update send-event-reminders edge function call
-- =====================================================

-- The edge function should now call get_users_needing_deadline_reminders()
-- instead of the old function name

-- =====================================================
-- PART 6: Set up Cron Job (via Supabase Dashboard or pg_cron)
-- =====================================================

-- Option A: Using Supabase Dashboard (Recommended)
-- 1. Go to Database > Functions
-- 2. Click "Create a new cron job"
-- 3. Schedule: 0 */6 * * * (every 6 hours)
-- 4. Function: 
--    SELECT net.http_post(
--        url := 'https://your-project.supabase.co/functions/v1/send-event-reminders',
--        headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-anon-key"}'::jsonb
--    );

-- Option B: Using pg_cron extension (if enabled)
/*
SELECT cron.schedule(
    'send-deadline-reminders',
    '0 */6 * * *', -- Every 6 hours
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-event-reminders',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        )
    );
    $$
);
*/

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================

SELECT '✅ Email notification system configured!' as status;
SELECT '📧 Confirmation emails will be sent when users mark events as applied' as feature_1;
SELECT '⏰ Reminder emails will be sent 1 day before application deadlines' as feature_2;
SELECT '📅 Google Calendar links are included in confirmation emails' as feature_3;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. Deploy edge functions:
--    - supabase functions deploy send-application-confirmation
--    - supabase functions deploy send-event-reminders
--
-- 2. Set up environment variables in Supabase Dashboard:
--    - RESEND_API_KEY (get from resend.com)
--    - FROM_EMAIL (your sender email)
--    - SUPABASE_URL (your project URL)
--    - SUPABASE_SERVICE_ROLE_KEY (from Dashboard > Settings > API)
--
-- 3. Update database settings with your Supabase URL and anon key:
--    ALTER DATABASE postgres SET app.settings.supabase_url = 'your-url';
--    ALTER DATABASE postgres SET app.settings.supabase_anon_key = 'your-key';
--
-- 4. Set up cron job to run send-event-reminders every 6 hours
--
-- 5. Test by marking an event as applied and checking your email!
-- =====================================================
