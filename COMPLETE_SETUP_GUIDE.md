# 🎉 Complete Setup Guide - User Sync & Event Email Reminders

This guide contains TWO major fixes for your careers platform:

## 📋 Table of Contents
1. [Fix 1: User Migration & Profile Updates](#fix-1-user-migration--profile-updates)
2. [Fix 2: Event Registration & Email Reminders](#fix-2-event-registration--email-reminders)
3. [Quick Start (TL;DR)](#quick-start-tldr)

---

## Fix 1: User Migration & Profile Updates

### ❌ Problem
- New users only created in `auth.users`, not in `user_profiles`
- Google OAuth users missing profiles
- Profile updates failing
- Admin panel can't see users

### ✅ Solution
Run **[QUICK_FIX_ALL.sql](QUICK_FIX_ALL.sql)** in Supabase SQL Editor

### What It Does
1. ✅ Creates automatic database trigger for new users
2. ✅ Syncs ALL existing orphan users from auth
3. ✅ Fixes RLS policies for profile updates
4. ✅ Fixes admin panel user visibility
5. ✅ BONUS: Adds event registration system

---

## Fix 2: Event Registration & Email Reminders

### 🎯 New Features Added
- Internal event registration tracking
- Automatic email reminders 1 day before deadline
- Registration limits and deadlines
- Real-time registration counts
- User registration status tracking

### 📁 Files Created
1. **Database Setup:**
   - [EVENT_REGISTRATION_AND_EMAIL_REMINDERS.sql](EVENT_REGISTRATION_AND_EMAIL_REMINDERS.sql) - Database schema
   
2. **Email Service:**
   - [supabase/functions/send-event-reminders/index.ts](supabase/functions/send-event-reminders/index.ts) - Edge function
   
3. **Frontend Components:**
   - [src/components/ui/event-registration-button.tsx](src/components/ui/event-registration-button.tsx) - Registration button
   - Updated: [events-section.tsx](src/components/ui/events-section.tsx)
   - Updated: [event-details-modal.tsx](src/components/ui/event-details-modal.tsx)
   
4. **Documentation:**
   - [SETUP_EVENT_REMINDERS.md](SETUP_EVENT_REMINDERS.md) - Detailed setup guide
   - [DATABASE_SETUP_INSTRUCTIONS.md](DATABASE_SETUP_INSTRUCTIONS.md) - Database fix guide

---

## Quick Start (TL;DR)

### Phase 1: Fix User Migration (5 minutes)

```bash
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy & paste QUICK_FIX_ALL.sql
# 3. Click Run
# 4. Done! Users will now sync automatically
```

✅ **Test:** Create a new account → Check it appears in `user_profiles` table  
✅ **Test:** Update your profile → Should save successfully

---

### Phase 2: Event Email Reminders (30 minutes)

#### Step 1: Database Setup (2 minutes)
Already done if you ran `QUICK_FIX_ALL.sql`! If not:
```sql
-- Run EVENT_REGISTRATION_AND_EMAIL_REMINDERS.sql in Supabase SQL Editor
```

#### Step 2: Email Service (5 minutes)
1. Sign up at [resend.com](https://resend.com) (free tier)
2. Get API key from Dashboard → API Keys
3. Add domain (optional) or use onboarding domain

#### Step 3: Deploy Edge Function (10 minutes)
```bash
# Install Supabase CLI
scoop install supabase  # Windows
# brew install supabase/tap/supabase  # Mac

# Login & link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set FROM_EMAIL=noreply@yourdomain.com

# Deploy
supabase functions deploy send-event-reminders
```

#### Step 4: Setup Cron Job (5 minutes)
```sql
-- Run in SQL Editor to schedule daily reminders at 9 AM UTC
SELECT cron.schedule(
    'send-event-reminders-daily',
    '0 9 * * *',
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

#### Step 5: Test (5 minutes)
```bash
# Test manually
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-event-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

---

## 🎨 Frontend Changes

The frontend has been automatically updated with:

### New Component: EventRegistrationButton
- Shows registration status (Available, Registered, Full, Closed)
- Handles registration logic
- Displays registration count
- Shows success/error messages

### Updated Components:
1. **events-section.tsx** - Added registration button to event cards
2. **event-details-modal.tsx** - Added registration in modal
3. **supabase.ts** - Added new Event interface fields

---

## 📊 Database Tables Created

### `event_registrations`
Tracks who registered for which events:
- `id` - Registration ID
- `event_id` - Event reference
- `user_id` - User reference
- `registered_at` - Registration timestamp
- `status` - registered | cancelled | attended
- `reminder_sent` - Boolean flag
- `reminder_sent_at` - When reminder was sent

### New Event Fields:
- `registration_deadline` - When registration closes
- `current_registrations` - Real-time count
- `enable_internal_registration` - Toggle internal vs external

---

## 🔧 API Functions Created

### For Frontend Use:
```typescript
// Register user for event
const { data } = await supabase
  .rpc('register_for_event', { p_event_id: eventId });

// Check registration status
const { data } = await supabase
  .rpc('get_user_event_registration_status', { p_event_id: eventId });
```

### For Backend/Cron:
```typescript
// Get users needing reminders (called by edge function)
const { data } = await supabase
  .rpc('get_users_needing_event_reminders');

// Mark reminder as sent
const { data } = await supabase
  .rpc('mark_reminder_sent', { p_registration_id: id });
```

---

## ✅ Testing Checklist

### User Migration Fix:
- [ ] New email signups appear in `user_profiles`
- [ ] Google OAuth signups create profiles
- [ ] Profile updates save successfully
- [ ] Admin panel shows all users
- [ ] No more "orphan" users in auth only

### Event Registration:
- [ ] Registration button appears on events
- [ ] Can register for events when logged in
- [ ] Shows "Please login" when not authenticated
- [ ] Registration count updates in real-time
- [ ] Can't register for full events
- [ ] Can't register after deadline

### Email Reminders:
- [ ] Manual trigger sends emails
- [ ] Cron job runs daily
- [ ] Emails received 1 day before deadline
- [ ] Reminders marked as sent in database
- [ ] No duplicate emails sent

---

## 🆘 Troubleshooting

### Users Still Not Syncing?
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Manually sync orphan users
INSERT INTO public.user_profiles (id, full_name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    'user'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
```

### Emails Not Sending?
```bash
# Check edge function logs
supabase functions logs send-event-reminders --tail

# Test with sample data
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-event-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY'
```

### Registration Button Not Working?
1. Check browser console for errors
2. Verify user is authenticated
3. Check Supabase SQL Editor for RLS policy errors
4. Ensure `register_for_event` function exists

---

## 📈 Monitoring

### View Registration Stats:
```sql
SELECT 
  e.title,
  e.event_date,
  e.registration_deadline,
  e.current_registrations,
  e.max_participants,
  COUNT(er.id) as actual_registrations
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
GROUP BY e.id, e.title, e.event_date, e.registration_deadline, e.current_registrations, e.max_participants
ORDER BY e.event_date ASC;
```

### View Reminder Status:
```sql
SELECT 
  e.title,
  e.registration_deadline,
  COUNT(*) as total_registered,
  SUM(CASE WHEN er.reminder_sent THEN 1 ELSE 0 END) as reminders_sent
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE er.status = 'registered'
GROUP BY e.id, e.title, e.registration_deadline
ORDER BY e.registration_deadline ASC;
```

---

## 🚀 What's Next?

### Recommended Enhancements:
1. ✉️ Add welcome emails for new users
2. 📧 Send event confirmation emails on registration
3. 🔔 Add in-app notifications
4. 📊 Create registration analytics dashboard
5. 🎫 Generate QR codes for event check-in
6. 📱 Add email preferences/unsubscribe

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs (Database → Logs)
3. Check Edge Function logs: `supabase functions logs`
4. Verify all environment variables are set

---

## 🎯 Summary

### What You've Accomplished:
✅ Fixed user migration from auth to profiles  
✅ Enabled profile updates for all users  
✅ Added internal event registration system  
✅ Set up automated email reminders  
✅ Created complete registration tracking  
✅ Updated all frontend components  

### Files You Need to Run:
1. **[QUICK_FIX_ALL.sql](QUICK_FIX_ALL.sql)** - Run this first (required)
2. Follow **[SETUP_EVENT_REMINDERS.md](SETUP_EVENT_REMINDERS.md)** for email setup (optional)

**Total Setup Time:** ~40 minutes (5 min for user fix + 35 min for email reminders)

---

**Ready to deploy? Start with running QUICK_FIX_ALL.sql, then test user registration!** 🚀
