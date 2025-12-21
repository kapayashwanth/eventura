-- =====================================================
-- UPDATE APPLICATION DEADLINES FOR EVENTS
-- =====================================================
-- This script:
-- 1. Ensures application_deadline column exists
-- 2. Sets default deadlines for existing events
-- 3. Provides examples for updating specific events
-- =====================================================

-- STEP 1: Ensure application_deadline column exists
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'application_deadline'
    ) THEN
        ALTER TABLE public.events ADD COLUMN application_deadline TIMESTAMPTZ;
        COMMENT ON COLUMN public.events.application_deadline IS 'Deadline for submitting event applications';
    END IF;
END $$;

-- =====================================================
-- STEP 2: Set default deadlines for events without one
-- =====================================================
-- Option A: Set deadline to 1 day before event date
UPDATE public.events 
SET application_deadline = event_date - INTERVAL '1 day'
WHERE application_deadline IS NULL 
AND event_date IS NOT NULL;

-- =====================================================
-- STEP 3: View current events with their deadlines
-- =====================================================
SELECT 
    id,
    title,
    event_date,
    application_deadline,
    CASE 
        WHEN application_deadline IS NULL THEN '⚠️ No deadline set'
        WHEN application_deadline < NOW() THEN '❌ Deadline passed'
        WHEN application_deadline <= NOW() + INTERVAL '7 days' THEN '⏰ Deadline soon'
        ELSE '✅ Active'
    END as status,
    category,
    location
FROM public.events
ORDER BY event_date DESC;

-- =====================================================
-- STEP 4: Update specific events (EXAMPLES)
-- =====================================================

-- Example 1: Set deadline to 3 days before event for all upcoming events
-- UPDATE public.events 
-- SET application_deadline = event_date - INTERVAL '3 days'
-- WHERE status = 'upcoming' 
-- AND event_date > NOW();

-- Example 2: Set deadline for a specific event by title
-- UPDATE public.events 
-- SET application_deadline = '2025-12-25 23:59:59+00'
-- WHERE title = 'Winter Hackathon 2025';

-- Example 3: Set deadline for events in a specific category
-- UPDATE public.events 
-- SET application_deadline = event_date - INTERVAL '5 days'
-- WHERE category = 'hackathon' 
-- AND application_deadline IS NULL;

-- Example 4: Extend deadline for all upcoming workshops by 2 days
-- UPDATE public.events 
-- SET application_deadline = application_deadline + INTERVAL '2 days'
-- WHERE category = 'workshop' 
-- AND status = 'upcoming'
-- AND application_deadline > NOW();

-- Example 5: Set same deadline for all events in January 2026
-- UPDATE public.events 
-- SET application_deadline = '2026-01-15 23:59:59+00'
-- WHERE event_date >= '2026-01-01' 
-- AND event_date < '2026-02-01';

-- =====================================================
-- STEP 5: Bulk update multiple events at once
-- =====================================================
-- Update deadlines for specific events by ID
-- UPDATE public.events 
-- SET application_deadline = CASE id
--     WHEN 'event-id-1' THEN '2025-12-28 23:59:59+00'
--     WHEN 'event-id-2' THEN '2026-01-15 18:00:00+00'
--     WHEN 'event-id-3' THEN '2026-02-01 12:00:00+00'
-- END
-- WHERE id IN ('event-id-1', 'event-id-2', 'event-id-3');

-- =====================================================
-- STEP 6: Set intelligent deadlines based on event type
-- =====================================================
-- Different lead times for different categories
UPDATE public.events 
SET application_deadline = CASE 
    WHEN category IN ('hackathon', 'competition') THEN event_date - INTERVAL '7 days'
    WHEN category IN ('conference', 'seminar') THEN event_date - INTERVAL '5 days'
    WHEN category IN ('workshop', 'tech-talk') THEN event_date - INTERVAL '3 days'
    WHEN category IN ('webinar') THEN event_date - INTERVAL '1 day'
    ELSE event_date - INTERVAL '2 days'
END
WHERE application_deadline IS NULL 
AND event_date IS NOT NULL
AND status = 'upcoming';

-- =====================================================
-- STEP 7: Find events that need deadline updates
-- =====================================================
-- Events with no deadline
SELECT 
    'Missing Deadline' as issue,
    id,
    title,
    event_date,
    category
FROM public.events
WHERE application_deadline IS NULL
AND status = 'upcoming';

-- Events where deadline is after event date (invalid)
SELECT 
    'Invalid Deadline' as issue,
    id,
    title,
    event_date,
    application_deadline,
    category
FROM public.events
WHERE application_deadline > event_date;

-- Events with past deadline but still marked as upcoming
SELECT 
    'Past Deadline' as issue,
    id,
    title,
    event_date,
    application_deadline,
    category
FROM public.events
WHERE application_deadline < NOW()
AND status = 'upcoming';

-- =====================================================
-- STEP 8: Verify all updates
-- =====================================================
SELECT 
    COUNT(*) as total_events,
    COUNT(application_deadline) as events_with_deadline,
    COUNT(*) - COUNT(application_deadline) as events_without_deadline,
    COUNT(CASE WHEN application_deadline > event_date THEN 1 END) as invalid_deadlines
FROM public.events;

-- =====================================================
-- STEP 9: Update event status based on application_deadline
-- =====================================================
-- This changes how events are marked as past/upcoming
-- Events now become "past" when application deadline passes, not when event date passes

-- Update status based on application_deadline (if set) or event_date (fallback)
UPDATE public.events 
SET status = CASE 
    WHEN application_deadline IS NOT NULL AND application_deadline < NOW() THEN 'past'
    WHEN application_deadline IS NOT NULL AND application_deadline >= NOW() THEN 'upcoming'
    WHEN application_deadline IS NULL AND event_date < NOW() THEN 'past'
    WHEN application_deadline IS NULL AND event_date >= NOW() THEN 'upcoming'
    ELSE status
END;

-- Verify the status update
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN application_deadline IS NOT NULL THEN 1 END) as with_deadline,
    COUNT(CASE WHEN application_deadline IS NULL THEN 1 END) as without_deadline
FROM public.events
GROUP BY status;

-- =====================================================
-- ✅ DONE!
-- =====================================================
-- Your events now have proper application deadlines set.
-- The website will automatically display these deadlines
-- on event cards and detail views.
-- =====================================================

-- =====================================================
-- QUICK REFERENCE: Common Deadline Updates
-- =====================================================

/*
-- Set all future events to have deadline 1 week before:
UPDATE public.events 
SET application_deadline = event_date - INTERVAL '7 days'
WHERE event_date > NOW() AND status = 'upcoming';

-- Set a specific deadline (use your timezone):
UPDATE public.events 
SET application_deadline = '2025-12-30 23:59:59+00'::TIMESTAMPTZ
WHERE title = 'Your Event Name';

-- Remove deadline (make it optional):
UPDATE public.events 
SET application_deadline = NULL
WHERE title = 'Your Event Name';

-- Copy event_date as deadline (applications close at event time):
UPDATE public.events 
SET application_deadline = event_date
WHERE id = 'your-event-id';
*/
