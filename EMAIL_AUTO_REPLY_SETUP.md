# 📧 Contact Form Auto-Reply Setup Guide

## Option 1: Netlify Form Notifications (Easy - No Code)

1. Go to **Netlify Dashboard** → Your Site → **Forms**
2. Click on "contact" form → **Form notifications**
3. Add **Outgoing webhook** with URL: `/.netlify/functions/contact-form-handler`

OR use **Email notification** to receive submissions at your email.

---

## Option 2: Resend API (Recommended for Auto-Reply)

### Step 1: Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (myamrita.me) or use their test domain
3. Create API key

### Step 2: Add Environment Variable
1. Go to **Netlify Dashboard** → Your Site → **Site settings**
2. Click **Environment variables**
3. Add: `RESEND_API_KEY` = your_resend_api_key

### Step 3: Set Up Form Webhook
1. Go to **Forms** → "contact" form → **Form notifications**
2. Click **Add notification** → **Outgoing webhook**
3. URL: `https://your-site.netlify.app/.netlify/functions/contact-form-handler`

---

## Option 3: SendGrid API (Alternative)

Replace the Resend code in `contact-form-handler.js` with:

```javascript
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SENDGRID_API_KEY}`
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email }] }],
    from: { email: 'noreply@myamrita.me', name: 'Amrita Careers' },
    subject: '✨ Thank you for contacting Amrita Careers!',
    content: [{ type: 'text/html', value: generateEmailHTML(name, subject) }]
  })
});
```

---

## Testing

1. Deploy to Netlify
2. Submit the contact form
3. Check:
   - Netlify Dashboard → Forms (for submissions)
   - Netlify Dashboard → Functions (for logs)
   - Your email inbox (for auto-reply)

---

## Email Features

✅ Dark theme matching website design
✅ Indigo-to-rose gradient accents
✅ Personalized greeting with user's name
✅ Reference to their subject/inquiry
✅ Expected response time info
✅ Helpful links to website sections
✅ Mobile-responsive design
