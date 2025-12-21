
# Email Notifications & Google Calendar Setup Guide

## 📧 Overview

This system provides two automated email features:
1. **Instant Confirmation Email** - Sent when user clicks "Mark as Applied"
2. **Deadline Reminder Email** - Sent 1 day before application deadline

Both emails include:
- ✅ Event details and information
- 📅 Google Calendar "Add to Calendar" link
- ⏰ Deadline reminders

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Run SQL Script in Supabase

1. Open Supabase Dashboard → **SQL Editor**
2. Copy and paste [SETUP_EMAIL_NOTIFICATIONS.sql](./SETUP_EMAIL_NOTIFICATIONS.sql)
3. Click **Run** (F5)

This creates:
- Updated `toggle_event_application` function (triggers confirmation email)
- `get_users_needing_deadline_reminders` function
- `mark_deadline_reminder_sent` function

### Step 2: Get Resend API Key (Free Email Service)

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (or use their test domain for development)
3. Create an API key
4. Copy the API key (starts with `re_`)

### Step 3: Deploy Edge Functions

Open your terminal in the project directory:

```bash
# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Deploy both edge functions
npx supabase functions deploy send-application-confirmation
npx supabase functions deploy send-event-reminders
```

### Step 4: Set Environment Variables

In Supabase Dashboard → **Edge Functions** → **Settings**:

```
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=noreply@yourdomain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_dashboard
```

Get these values from:
- **RESEND_API_KEY**: From resend.com dashboard
- **FROM_EMAIL**: Your verified email domain
- **SUPABASE_URL**: Dashboard → Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Dashboard → Settings → API → service_role key

### Step 5: Set Up Database Settings & Cron Job

Run these SQL commands in Supabase SQL Editor:

```sql
-- Set database configuration
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_anon_key = 'your-anon-key-here';
```

Then set up the cron job in **Database** → **Cron Jobs** → **Create**:

- **Name**: `send-deadline-reminders`
- **Schedule**: `0 */6 * * *` (every 6 hours)
- **SQL**:
```sql
SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-event-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-anon-key"}'::jsonb
);
```

---

## ✅ How It Works

### 1. Confirmation Email (Instant)

**Trigger:** User clicks "Mark as Applied" button

**Flow:**
1. User clicks button
2. `toggle_event_application` function executes
3. Creates/updates application record
4. Calls `send-application-confirmation` edge function
5. Function fetches event + user details
6. Generates Google Calendar link
7. Sends confirmation email via Resend

**Email Contains:**
- ✅ Confirmation badge
- 📅 Event date and time
- ⏱️ Application deadline
- 📍 Location
- 📝 Description
- 🔗 **Google Calendar "Add to Calendar" button**
- 💡 Note about upcoming reminder

### 2. Deadline Reminder Email (1 Day Before)

**Trigger:** Cron job runs every 6 hours

**Flow:**
1. Cron job calls `send-event-reminders` function
2. Function calls `get_users_needing_deadline_reminders`
3. SQL finds applications with deadlines in 23-25 hours
4. For each user, sends reminder email
5. Marks `reminder_sent = true` to prevent duplicates

**Email Contains:**
- ⏰ Deadline warning banner
- 📅 Event date and time
- ⏱️ Application deadline (highlighted)
- 📍 Location
- 📝 Event description
- ✅ Action items checklist

---

## 📅 Google Calendar Integration

The confirmation email includes a **"Add to Google Calendar"** button.

**What it does:**
- Pre-fills event title, date, time, location, description
- Opens Google Calendar in browser
- User just clicks "Save" to add event
- Event duration: 2 hours (configurable)

**Link Format:**
```
https://calendar.google.com/calendar/render?action=TEMPLATE&text=Event+Title&dates=20260115T100000Z/20260115T120000Z&details=Description&location=Venue
```

**Generated automatically** - no user input needed!

---

## 🧪 Testing

### Test Confirmation Email

1. Make sure SQL script is run
2. Edge function is deployed
3. Environment variables are set
4. Mark any event as applied
5. Check your email (might take 30 seconds)

**Troubleshooting:**
```sql
-- Check if application was created
SELECT * FROM event_applications WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 5;

-- Check edge function logs
-- Go to: Dashboard → Edge Functions → send-application-confirmation → Logs
```

### Test Reminder Email

**Option A: Manual Test**

Run this in SQL Editor to manually trigger reminders:

```sql
SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-event-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-anon-key"}'::jsonb
);
```

**Option B: Create Test Event**

1. Create an event with deadline = 24 hours from now
2. Mark it as applied
3. Wait for cron job or manually trigger (Option A)
4. Check email

**Verify Cron Setup:**
```sql
-- Check cron jobs
SELECT * FROM cron.job;

-- Check recent cron runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 📊 Monitoring

### Check Email Delivery Status

```sql
-- Count sent reminders
SELECT 
    COUNT(*) FILTER (WHERE reminder_sent = true) as reminders_sent,
    COUNT(*) FILTER (WHERE reminder_sent = false) as pending_reminders
FROM event_applications
WHERE is_applied = true;

-- Find users who will receive reminders soon
SELECT * FROM get_users_needing_deadline_reminders();

-- Applications created in last 24 hours
SELECT 
    ea.*,
    e.title as event_title,
    up.full_name as user_name
FROM event_applications ea
JOIN events e ON ea.event_id = e.id
JOIN user_profiles up ON ea.user_id = up.id
WHERE ea.created_at > NOW() - INTERVAL '24 hours'
AND ea.is_applied = true
ORDER BY ea.created_at DESC;
```

### Check Edge Function Logs

Dashboard → **Edge Functions** → Select function → **Logs**

Look for:
- ✅ `Email sent to user@example.com`
- ❌ `Failed to send email:` (check Resend API key)
- 📧 `Would send email` (means RESEND_API_KEY not set)

---

## 🔧 Customization

### Change Email Design

Edit the HTML template in:
- [supabase/functions/send-application-confirmation/index.ts](./supabase/functions/send-application-confirmation/index.ts)
- [supabase/functions/send-event-reminders/index.ts](./supabase/functions/send-event-reminders/index.ts)

### Change Reminder Timing

Currently: **1 day before deadline**

To change to 2 days:

```sql
-- In get_users_needing_deadline_reminders function
-- Change this:
AND e.application_deadline <= NOW() + INTERVAL '49 hours'  -- was 25
AND e.application_deadline >= NOW() + INTERVAL '47 hours'  -- was 23
```

### Change Cron Schedule

Currently: **Every 6 hours** (`0 */6 * * *`)

Common alternatives:
- Every hour: `0 * * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at 9 AM: `0 9 * * *`
- Twice daily (9 AM & 9 PM): `0 9,21 * * *`

---

## 🛠️ Troubleshooting

### Emails Not Sending

**Check 1: RESEND_API_KEY is set**
```bash
# In edge function logs, you should NOT see:
"⚠️ RESEND_API_KEY not configured"
```

**Check 2: Verify Resend API key works**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_your_key" \
  -H "Content-Type: application/json" \
  -d '{"from":"onboarding@resend.dev","to":"you@example.com","subject":"Test","html":"<p>Test</p>"}'
```

**Check 3: Check FROM_EMAIL is verified**
- Go to resend.com → Domains
- Your domain should be verified (green checkmark)
- Or use their test domain: `onboarding@resend.dev`

### Google Calendar Link Not Working

Check the link format in browser:
```
https://calendar.google.com/calendar/render?action=TEMPLATE&text=...
```

If broken, check:
- Event dates are valid
- URL encoding is correct
- Link opens Google Calendar

### Reminders Not Sending

**Check 1: Cron job is running**
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

**Check 2: Users need reminders**
```sql
SELECT * FROM get_users_needing_deadline_reminders();
```

If empty, create a test event with deadline = NOW() + 24 hours

**Check 3: Deadline is set**
```sql
SELECT title, application_deadline 
FROM events 
WHERE application_deadline IS NOT NULL 
ORDER BY application_deadline;
```

---

## 📝 Files Created/Modified

| File | Purpose |
|------|---------|
| [SETUP_EMAIL_NOTIFICATIONS.sql](./SETUP_EMAIL_NOTIFICATIONS.sql) | Database functions and setup |
| [send-application-confirmation/index.ts](./supabase/functions/send-application-confirmation/index.ts) | Instant confirmation email |
| [send-event-reminders/index.ts](./supabase/functions/send-event-reminders/index.ts) | Deadline reminder email |

---

## 🎯 What Users Experience

### When Marking Event as Applied:
1. Click "Mark as Applied" button
2. Button changes to "✓ Applied" instantly
3. Within 30 seconds: Email arrives with:
   - Confirmation message
   - Event details
   - **"Add to Google Calendar" button** ← Click this!
   - Notice about reminder

### 24 Hours Before Deadline:
1. Email arrives automatically
2. Reminds them deadline is tomorrow
3. Includes all event details again
4. Action checklist

---

## 🔒 Security Notes

- ✅ Functions use `SECURITY DEFINER` to bypass RLS
- ✅ Service role key only in edge functions (never exposed to client)
- ✅ Email sent server-side via Resend (no spam)
- ✅ Cron job authenticated with Supabase anon key
- ✅ User emails fetched securely from `auth.users`

---

## ✨ Summary

After setup:
- ✅ Users get confirmation email when applying (with calendar link)
- ✅ Users get reminder 1 day before deadline
- ✅ Google Calendar integration (one-click add)
- ✅ Fully automated via cron job
- ✅ Beautiful HTML emails via Resend

**Setup time: ~15 minutes**  
**Cost: Free** (Resend: 3,000 emails/month free, Supabase: included)

🎉 **You're all set!**
