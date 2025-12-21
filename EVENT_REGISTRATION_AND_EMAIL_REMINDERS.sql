-- =====================================================
-- EVENT REGISTRATION & EMAIL REMINDERS SYSTEM
-- =====================================================
-- This script adds:
-- 1. Event registration tracking (when users click "Apply")
-- 2. Automatic email reminders 1 day before event deadline
-- 3. Database triggers and functions for automation
-- =====================================================

-- =====================================================
-- PART 1: CREATE EVENT REGISTRATIONS TABLE
-- =====================================================

-- Create table to track who registered for which events
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id) -- Prevent duplicate registrations
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_reminder ON public.event_registrations(reminder_sent, registered_at) 
WHERE status = 'registered' AND reminder_sent = FALSE;

-- =====================================================
-- PART 2: ADD REGISTRATION DEADLINE TO EVENTS TABLE
-- =====================================================

-- Add registration deadline column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'registration_deadline'
    ) THEN
        ALTER TABLE public.events ADD COLUMN registration_deadline TIMESTAMPTZ;
        -- Set default deadline to event_date for existing events
        UPDATE public.events SET registration_deadline = event_date WHERE registration_deadline IS NULL;
    END IF;
END $$;

-- Add internal registration enabled flag
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'enable_internal_registration'
    ) THEN
        ALTER TABLE public.events ADD COLUMN enable_internal_registration BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add current registrations count
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'current_registrations'
    ) THEN
        ALTER TABLE public.events ADD COLUMN current_registrations INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- PART 3: RLS POLICIES FOR EVENT REGISTRATIONS
-- =====================================================

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view all registrations (to see who's attending)
DROP POLICY IF EXISTS "Anyone can view event registrations" ON public.event_registrations;
CREATE POLICY "Anyone can view event registrations" ON public.event_registrations
    FOR SELECT
    USING (true);

-- Users can register for events (insert their own registration)
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own registrations
DROP POLICY IF EXISTS "Users can update own registrations" ON public.event_registrations;
CREATE POLICY "Users can update own registrations" ON public.event_registrations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can manage all registrations
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.event_registrations;
CREATE POLICY "Admins can manage all registrations" ON public.event_registrations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- =====================================================
-- PART 4: UPDATE EVENT REGISTRATION COUNT TRIGGER
-- =====================================================

-- Function to update event registration count
CREATE OR REPLACE FUNCTION public.update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'registered') THEN
        UPDATE public.events 
        SET current_registrations = current_registrations + 1 
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'registered' AND NEW.status != 'registered') THEN
        UPDATE public.events 
        SET current_registrations = GREATEST(current_registrations - 1, 0) 
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'registered' AND NEW.status = 'registered') THEN
        UPDATE public.events 
        SET current_registrations = current_registrations + 1 
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'registered') THEN
        UPDATE public.events 
        SET current_registrations = GREATEST(current_registrations - 1, 0) 
        WHERE id = OLD.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_registration_change ON public.event_registrations;
CREATE TRIGGER on_registration_change
    AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_event_registration_count();

-- =====================================================
-- PART 5: FUNCTION TO GET USERS NEEDING REMINDERS
-- =====================================================

-- Function to get users who need reminders (1 day before deadline)
CREATE OR REPLACE FUNCTION public.get_users_needing_event_reminders()
RETURNS TABLE (
    registration_id UUID,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    event_id UUID,
    event_title TEXT,
    event_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ,
    event_location TEXT,
    event_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id as registration_id,
        er.user_id,
        up.email as user_email,
        up.full_name as user_name,
        e.id as event_id,
        e.title as event_title,
        e.event_date,
        e.registration_deadline,
        e.location as event_location,
        e.description as event_description
    FROM public.event_registrations er
    JOIN public.user_profiles up ON er.user_id = up.id
    JOIN public.events e ON er.event_id = e.id
    WHERE 
        er.status = 'registered'
        AND er.reminder_sent = FALSE
        AND e.registration_deadline IS NOT NULL
        -- Send reminder 1 day before deadline
        AND e.registration_deadline > NOW()
        AND e.registration_deadline <= NOW() + INTERVAL '25 hours' -- Buffer for timing
        AND e.registration_deadline >= NOW() + INTERVAL '23 hours'
    ORDER BY e.registration_deadline ASC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_users_needing_event_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_needing_event_reminders() TO service_role;

-- =====================================================
-- PART 6: FUNCTION TO MARK REMINDER AS SENT
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_reminder_sent(p_registration_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.event_registrations
    SET 
        reminder_sent = TRUE,
        reminder_sent_at = NOW(),
        updated_at = NOW()
    WHERE id = p_registration_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.mark_reminder_sent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_reminder_sent(UUID) TO service_role;

-- =====================================================
-- PART 7: FUNCTION TO REGISTER USER FOR EVENT
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_event events%ROWTYPE;
    v_registration_id UUID;
    v_result JSON;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'You must be logged in to register for events'
        );
    END IF;
    
    -- Get event details
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Event not found'
        );
    END IF;
    
    -- Check if registration is still open
    IF v_event.registration_deadline IS NOT NULL AND v_event.registration_deadline < NOW() THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Registration deadline has passed'
        );
    END IF;
    
    -- Check if event is full
    IF v_event.max_participants IS NOT NULL AND v_event.current_registrations >= v_event.max_participants THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Event is full'
        );
    END IF;
    
    -- Try to insert registration (or update if already exists)
    INSERT INTO public.event_registrations (event_id, user_id, status)
    VALUES (p_event_id, v_user_id, 'registered')
    ON CONFLICT (event_id, user_id) 
    DO UPDATE SET 
        status = 'registered',
        updated_at = NOW()
    RETURNING id INTO v_registration_id;
    
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Successfully registered for event',
        'registration_id', v_registration_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.register_for_event(UUID) TO authenticated;

-- =====================================================
-- PART 8: FUNCTION TO CHECK USER REGISTRATION STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_event_registration_status(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_registration event_registrations%ROWTYPE;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('registered', FALSE);
    END IF;
    
    SELECT * INTO v_registration 
    FROM public.event_registrations 
    WHERE event_id = p_event_id AND user_id = v_user_id;
    
    IF FOUND THEN
        RETURN json_build_object(
            'registered', TRUE,
            'status', v_registration.status,
            'registered_at', v_registration.registered_at
        );
    ELSE
        RETURN json_build_object('registered', FALSE);
    END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_event_registration_status(UUID) TO authenticated;

-- =====================================================
-- PART 9: INITIALIZE CURRENT REGISTRATIONS FOR EXISTING EVENTS
-- =====================================================

-- Update current_registrations count for all existing events
UPDATE public.events e
SET current_registrations = (
    SELECT COUNT(*) 
    FROM public.event_registrations er 
    WHERE er.event_id = e.id AND er.status = 'registered'
);

-- =====================================================
-- SUCCESS! 
-- =====================================================
-- Next steps:
-- 1. Deploy the edge function for sending reminder emails
-- 2. Set up a cron job to call the reminder function daily
-- 3. Update your frontend to use the new registration system
-- =====================================================

-- Verify setup
SELECT 'Event registrations table created!' as status;
SELECT 'Run the Edge Function setup next (see EVENT_REMINDER_EDGE_FUNCTION.ts)' as next_step;
