# Event Registration & Email Reminders Setup Guide

This guide will help you set up event registration tracking and automated email reminders for users who apply to events.

## 🎯 Features

✅ **Internal Event Registration** - Users can register for events directly in your app  
✅ **Registration Tracking** - Track who registered for which events  
✅ **Automated Email Reminders** - Send emails 1 day before event registration deadline  
✅ **Registration Limits** - Enforce max participants per event  
✅ **Real-time Updates** - See live registration counts  

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Completed the user migration fix ([QUICK_FIX_ALL.sql](QUICK_FIX_ALL.sql))
- ✅ Access to your Supabase Dashboard
- ✅ A Resend.com account (free tier available) for sending emails

---

## 🚀 Step 1: Database Setup

### 1.1 Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of **[EVENT_REGISTRATION_AND_EMAIL_REMINDERS.sql](EVENT_REGISTRATION_AND_EMAIL_REMINDERS.sql)**
4. Click **Run**

This will create:
- ✅ `event_registrations` table
- ✅ Database triggers and functions
- ✅ RLS policies
- ✅ Helper functions for registration

### 1.2 Verify the Setup

Run this query to verify:
```sql
SELECT * FROM event_registrations;
SELECT * FROM events LIMIT 5;
```

---

## 📧 Step 2: Email Service Setup (Resend.com)

### 2.1 Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email

### 2.2 Get Your API Key

1. Go to **API Keys** in Resend Dashboard
2. Click **Create API Key**
3. Name it: `Event Reminders`
4. Copy the API key (starts with `re_`)

### 2.3 Configure Domain (Optional but Recommended)

1. Go to **Domains** in Resend Dashboard
2. Add your domain
3. Add the DNS records shown
4. Wait for verification (usually instant)

If you don't have a domain, you can use Resend's onboarding domain for testing.

---

## ⚡ Step 3: Deploy Edge Function

### 3.1 Install Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Link Your Project

```bash
cd c:\Users\kapay\Desktop\careers
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in Supabase Dashboard → Settings → General

### 3.4 Set Environment Secrets

```bash
# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Set your from email address
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
```

### 3.5 Deploy the Function

```bash
supabase functions deploy send-event-reminders
```

---

## ⏰ Step 4: Set Up Cron Job (Automated Reminders)

### 4.1 Enable pg_cron Extension

1. Go to **Database** → **Extensions** in Supabase Dashboard
2. Search for `pg_cron`
3. Enable it

### 4.2 Create the Cron Job

Run this in SQL Editor:

```sql
-- Schedule reminder emails to run daily at 9 AM UTC
SELECT cron.schedule(
    'send-event-reminders-daily',
    '0 9 * * *', -- Every day at 9 AM UTC
    $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-event-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);
```

Replace:
- `YOUR_PROJECT_REF` with your project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key (from Settings → API)

### 4.3 Verify Cron Job

```sql
-- Check if cron job is scheduled
SELECT * FROM cron.job;
```

---

## 💻 Step 5: Update Frontend Code

### 5.1 Add Registration Button Component

I'll create this for you in the next step. The button will:
- Show "Register" for events users haven't registered for
- Show "Registered ✓" for events users have registered for
- Handle the registration logic
- Show registration count and limits

### 5.2 Update Event Components

The registration button will be added to:
- Event cards in the events section
- Event details modal
- Upcoming events page

---

## 🧪 Step 6: Testing

### 6.1 Test Registration

1. Login to your app
2. Navigate to an event
3. Click "Register"
4. Check database: `SELECT * FROM event_registrations;`

### 6.2 Test Email Reminders Manually

Run this in your terminal:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-event-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

Check the response and your email inbox!

### 6.3 Test with Sample Data

```sql
-- Create a test event with deadline tomorrow
INSERT INTO events (
  title, 
  description, 
  event_date, 
  registration_deadline,
  status,
  category
) VALUES (
  'Test Event',
  'Testing email reminders',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '1 day',
  'upcoming',
  'general'
);

-- Register yourself for it (replace with your user ID)
SELECT register_for_event('EVENT_ID_HERE');

-- Wait for cron job or trigger manually
```

---

## 📊 Step 7: Monitor & Manage

### View All Registrations

```sql
SELECT 
  e.title,
  e.event_date,
  e.registration_deadline,
  e.current_registrations,
  e.max_participants,
  up.full_name,
  up.email,
  er.registered_at,
  er.reminder_sent
FROM event_registrations er
JOIN events e ON er.event_id = e.id
JOIN user_profiles up ON er.user_id = up.id
ORDER BY e.event_date ASC;
```

### Check Reminder Status

```sql
SELECT 
  COUNT(*) as total_registrations,
  SUM(CASE WHEN reminder_sent THEN 1 ELSE 0 END) as reminders_sent,
  SUM(CASE WHEN NOT reminder_sent THEN 1 ELSE 0 END) as reminders_pending
FROM event_registrations
WHERE status = 'registered';
```

---

## 🎨 Next Steps

1. ✅ Run the database migration
2. ✅ Set up Resend.com account
3. ✅ Deploy the edge function
4. ✅ Configure cron job
5. ⏳ I'll update your frontend components next

Let me know when you've completed steps 1-4, and I'll create the frontend registration components for you!

---

## 🆘 Troubleshooting

### Emails Not Sending?

- Check your Resend API key is correct
- Verify domain is verified in Resend
- Check edge function logs: `supabase functions logs send-event-reminders`

### Cron Job Not Running?

- Check if pg_cron is enabled
- Verify the cron schedule: `SELECT * FROM cron.job;`
- Check cron logs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`

### Registration Not Working?

- Check RLS policies are set up
- Verify user is authenticated
- Check browser console for errors

---

## 📝 Environment Variables Needed

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

For the edge function (set via Supabase secrets):
```
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com
```

---

**Ready to implement? Run the SQL migration first, then let me know when you're ready for the frontend code!** 🚀
