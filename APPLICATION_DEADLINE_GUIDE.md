# Application Deadline Feature - Complete Guide

## 📋 Overview

The application deadline feature allows admins to set a cutoff date/time for event applications. This deadline is displayed throughout the site and helps users know when they need to apply.

---

## 🎯 What Was Changed

### 1. **Event Form** - Admin Can Set Deadlines
- Added "Application Deadline" date-time picker in the admin event creation/edit form
- Located next to the "Event Date" field
- Optional field - leave blank if no deadline needed
- Automatically saved when creating or updating events

**File Modified:** `src/components/ui/event-form.tsx`

### 2. **Database Column** - Stores Deadline Data
- Column: `application_deadline` (TIMESTAMPTZ)
- Allows NULL values (optional deadline)
- Automatically indexed for performance

### 3. **Display Locations** - Where Users See Deadlines

#### ✅ Event Details Modal
- Shows application deadline in a highlighted yellow card
- Displays full date and time
- Only shows if deadline is set

**File Modified:** `src/components/ui/event-details-modal.tsx`

#### ✅ Event Registration Button
- Shows "Deadline: [date]" below the apply button
- Only visible when deadline exists and user hasn't applied yet

**File:** `src/components/ui/event-registration-button.tsx` ✓ Already working

#### ✅ Registered Events Page
- Shows deadline for each registered event
- Helps users track when applications close

**File:** `src/components/ui/registered-events-page.tsx` ✓ Already working

#### ✅ Applied Events Section
- Displays deadline with clock icon
- Shows in profile applied events list

**File:** `src/components/ui/applied-events-section.tsx` ✓ Already working

#### ✅ Admin Dashboard
- Shows deadline in event applications admin view
- Helps admins track which events have deadlines

**File:** `src/components/ui/event-applications-admin.tsx` ✓ Already working

---

## 🗄️ Database Setup

### Step 1: Run the SQL Script in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `UPDATE_APPLICATION_DEADLINES.sql`
5. Click **Run** or press **F5**

### What the SQL Does:

✅ **Creates the column** (if it doesn't exist)
```sql
ALTER TABLE public.events ADD COLUMN application_deadline TIMESTAMPTZ;
```

✅ **Sets default deadlines** for existing events (1 day before event)
```sql
UPDATE public.events 
SET application_deadline = event_date - INTERVAL '1 day'
WHERE application_deadline IS NULL;
```

✅ **Provides examples** for customizing deadlines by category, date, or event

---

## 📝 How to Use (Admin Guide)

### Creating a New Event with Deadline

1. Go to Admin Dashboard
2. Click "Add New Event"
3. Fill in all event details
4. Set **Event Date & Time** (when the event happens)
5. Set **Application Deadline** (when applications close)
   - Should be BEFORE the event date
   - Example: Event on Jan 15 → Deadline on Jan 10
6. Click "Save Event"

### Editing Existing Event Deadline

1. Go to Admin Dashboard → Events Table
2. Click "Edit" on any event
3. Update the **Application Deadline** field
4. Click "Save Event"

### Removing a Deadline

1. Edit the event
2. Clear the **Application Deadline** field (leave it empty)
3. Save - the event will have no deadline restriction

---

## 🔧 Customizing Deadlines in Database

### Quick Updates (Copy to Supabase SQL Editor)

#### Set all upcoming events to 7 days before:
```sql
UPDATE public.events 
SET application_deadline = event_date - INTERVAL '7 days'
WHERE event_date > NOW() AND status = 'upcoming';
```

#### Set specific deadline for one event:
```sql
UPDATE public.events 
SET application_deadline = '2025-12-30 23:59:59+00'::TIMESTAMPTZ
WHERE title = 'Winter Hackathon 2025';
```

#### Different deadlines by event type:
```sql
UPDATE public.events 
SET application_deadline = CASE 
    WHEN category = 'hackathon' THEN event_date - INTERVAL '7 days'
    WHEN category = 'workshop' THEN event_date - INTERVAL '3 days'
    WHEN category = 'webinar' THEN event_date - INTERVAL '1 day'
    ELSE event_date - INTERVAL '2 days'
END
WHERE status = 'upcoming' AND application_deadline IS NULL;
```

#### Extend all deadlines by 2 days:
```sql
UPDATE public.events 
SET application_deadline = application_deadline + INTERVAL '2 days'
WHERE status = 'upcoming' AND application_deadline > NOW();
```

---

## 🎨 How It Looks on the Site

### Event Details Modal
```
┌─────────────────────────────────────┐
│  📅 Event Date                      │
│     Monday, January 15, 2026        │
│     10:00 AM                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⏰ Application Deadline (Yellow)   │
│     Friday, January 10, 2026        │
│     11:59 PM                        │
└─────────────────────────────────────┘
```

### Event Card (Registration Button)
```
┌──────────────────────────────┐
│  [✓ Mark as Applied]         │
│  ⏰ Deadline: Jan 10, 2026   │
└──────────────────────────────┘
```

### Registered Events Page
```
┌─────────────────────────────────────┐
│  📅 Event: January 15, 2026         │
│  ⏰ Deadline: January 10, 2026      │
│  📍 Main Auditorium                 │
└─────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After setting up, verify these work correctly:

- [ ] Create a new event with a deadline → Saves correctly
- [ ] Edit an existing event deadline → Updates correctly
- [ ] View event details modal → Deadline shows in yellow card
- [ ] Check event registration button → Deadline displays below button
- [ ] Go to Registered Events page → Deadline shows for each event
- [ ] Check Admin Dashboard → Events table shows deadline column
- [ ] SQL query: Check all events have deadlines
  ```sql
  SELECT title, event_date, application_deadline 
  FROM public.events 
  WHERE status = 'upcoming';
  ```

---

## 🛠️ Troubleshooting

### Deadline Not Showing on Site
1. **Check if deadline is set in database:**
   ```sql
   SELECT id, title, application_deadline 
   FROM public.events 
   WHERE title = 'Your Event Name';
   ```
2. **If NULL:** Update it using admin form or SQL
3. **Clear browser cache** and reload

### Deadline Shows Wrong Time
- Supabase stores times in UTC
- Your browser converts to local timezone automatically
- To force a timezone:
  ```sql
  UPDATE public.events 
  SET application_deadline = '2025-12-30 23:59:59+05:30'::TIMESTAMPTZ
  WHERE title = 'Event Name';
  ```
  (Change +05:30 to your timezone offset)

### Old Events Still Show No Deadline
Run this to set defaults:
```sql
UPDATE public.events 
SET application_deadline = event_date - INTERVAL '1 day'
WHERE application_deadline IS NULL;
```

---

## 📊 Database Query Examples

### Find events with missing deadlines:
```sql
SELECT title, event_date, application_deadline
FROM public.events
WHERE application_deadline IS NULL
AND status = 'upcoming';
```

### Find events with passed deadlines:
```sql
SELECT title, event_date, application_deadline
FROM public.events
WHERE application_deadline < NOW()
AND status = 'upcoming';
```

### Count events by deadline status:
```sql
SELECT 
    CASE 
        WHEN application_deadline IS NULL THEN 'No Deadline'
        WHEN application_deadline < NOW() THEN 'Deadline Passed'
        WHEN application_deadline <= NOW() + INTERVAL '7 days' THEN 'Closing Soon'
        ELSE 'Open'
    END as status,
    COUNT(*) as count
FROM public.events
WHERE status = 'upcoming'
GROUP BY status;
```

---

## 🎓 Best Practices

1. **Set Realistic Deadlines**
   - Give users enough time to apply (3-7 days minimum)
   - Consider event type: Hackathons need more prep time

2. **Communicate Clearly**
   - Deadline is displayed automatically on all event views
   - Consider sending email reminders near deadline

3. **Regular Updates**
   - Review upcoming events weekly
   - Extend deadlines if needed using admin form or SQL

4. **Consistent Patterns**
   - Use similar deadlines for similar event types
   - Example: All workshops → 3 days before, All hackathons → 7 days before

---

## 📁 Files Modified

| File | Purpose | Changes |
|------|---------|---------|
| `event-form.tsx` | Admin form | Added deadline input field |
| `event-details-modal.tsx` | Event popup | Added deadline display card |
| `UPDATE_APPLICATION_DEADLINES.sql` | Database setup | Creates column & sets defaults |

---

## 🚀 Quick Start Summary

1. **Run SQL Script:** `UPDATE_APPLICATION_DEADLINES.sql` in Supabase
2. **Verify Column Exists:** Check events table has `application_deadline`
3. **Create/Edit Events:** Use admin form to set deadlines
4. **Test Display:** View events on site to see deadline
5. **Done!** ✅

---

## 💡 Need Help?

- Check if column exists: SQL Editor → `SELECT * FROM public.events LIMIT 1;`
- View all deadlines: `SELECT title, application_deadline FROM public.events;`
- Reset all deadlines: Run Step 2 from `UPDATE_APPLICATION_DEADLINES.sql`

**The deadline feature is now fully integrated and ready to use!** 🎉
