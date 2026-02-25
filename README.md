# Eventura — Campus Event Management Platform

A full-stack campus event management platform built with **React**, **Convex**, and **Firebase Auth**. Eventura lets students discover, apply to, and track campus events while giving administrators a complete dashboard to manage events, monitor applications, and send targeted email notifications.

**Live:** [eventura.live](https://eventura.live)

---

## Features

### Students
- Browse upcoming and past campus events with category filters
- Apply/withdraw from events with one click
- Set deadline reminders — receive email alerts before registration closes
- View personal application history and registered events
- Manage profile (name, department, year, bio, profile image)

### Administrators
- Create, edit, and delete events (with banner images, deadlines, categories)
- View and manage all user applications
- Full users table with profile details
- Send bulk or individual emails to users via a built-in email composer
- Dashboard overview with key metrics

### Automated
- **Cron: Deadline Reminders** — Hourly check sends email reminders to users who opted in, when an event deadline is within 24 hours
- **Cron: Auto-Transition** — Automatically moves events from *upcoming* to *past* when their date/deadline passes
- **Welcome Email** — Sent on first sign-up
- **New Event Notification** — All registered users receive an email when a new event is published

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion, Three.js (hero shader) |
| Backend | Convex (real-time database, mutations, actions, crons) |
| Auth | Firebase Authentication (Email/Password + Google Sign-In) |
| Email | ZeptoMail by Zoho (transactional email API) |
| Hosting | Netlify (frontend) + Convex Cloud (backend) |

---

## Project Structure

```
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema (events, user_profiles, event_applications)
│   ├── events.ts           # Event CRUD mutations & queries
│   ├── eventApplications.ts# Application mutations & queries
│   ├── userProfiles.ts     # User profile mutations & queries
│   ├── emails.ts           # ZeptoMail email actions (welcome, reminders, notifications)
│   ├── emailTemplates.ts   # HTML email template builders
│   ├── crons.ts            # Scheduled jobs (reminders + auto-transition)
│   └── _generated/         # Auto-generated Convex types
├── src/
│   ├── main.tsx            # App entry — Convex & Auth providers
│   ├── App.tsx             # Router & page layout
│   ├── lib/
│   │   ├── firebase.ts     # Firebase config & auth helpers
│   │   ├── AuthContext.tsx  # React auth context provider
│   │   ├── types.ts        # Shared TypeScript types
│   │   └── utils.ts        # Utility functions
│   └── components/ui/      # All UI components
│       ├── navbar.tsx
│       ├── footer.tsx
│       ├── shape-landing-hero.tsx
│       ├── events-section.tsx
│       ├── upcoming-events-page.tsx
│       ├── past-events-page.tsx
│       ├── event-details-modal.tsx
│       ├── event-registration-button.tsx
│       ├── admin-dashboard.tsx
│       ├── admin-email-sender.tsx
│       ├── event-form.tsx
│       ├── events-table.tsx
│       ├── users-table.tsx
│       ├── profile-page.tsx
│       └── ...
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.cjs
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Convex](https://convex.dev) account
- A [Firebase](https://console.firebase.google.com) project with Authentication enabled
- A [ZeptoMail](https://www.zoho.com/zeptomail/) account (for transactional emails)

### 1. Clone & Install

```bash
git clone https://github.com/kapayashwanth/eventura.git
cd eventura
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Convex
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Set Up Convex

```bash
npx convex dev
```

This will push your schema and functions to your Convex deployment.

Set your ZeptoMail token as a Convex environment variable:

```bash
npx convex env set ZEPTOMAIL_TOKEN "your_zeptomail_api_token"
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

### Convex (Backend)

```bash
npx convex deploy
```

### Netlify (Frontend)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |

Add these environment variables in **Netlify > Site settings > Environment variables**:

| Variable | Value |
|----------|-------|
| `VITE_CONVEX_URL` | `https://<your-prod-deployment>.convex.cloud` |
| `VITE_FIREBASE_API_KEY` | your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | your Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | your Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | your Firebase app ID |

> **Note:** `ZEPTOMAIL_TOKEN` is a server-side Convex environment variable — it does **not** go in Netlify.

---

## Database Schema

### `events`
| Field | Type | Description |
|-------|------|-------------|
| title | string | Event name |
| description | string? | Event description |
| event_date | string | Date of the event |
| event_time | string? | Time of the event |
| registration_link | string? | External registration URL |
| application_deadline | string? | Deadline for applications |
| banner_image | string? | Banner image URL |
| category | string? | hackathon, workshop, tech-talk, seminar, conference, competition, webinar, general |
| status | string | upcoming, past, or cancelled |
| location | string? | Venue |
| organizer | string? | Organizing body |
| max_participants | number? | Capacity limit |
| created_by | string? | Creator's Firebase UID |

### `user_profiles`
| Field | Type | Description |
|-------|------|-------------|
| firebase_uid | string | Firebase UID |
| full_name | string | Display name |
| email | string | Email address |
| mobile_number | string? | Phone number |
| department | string? | Academic department |
| year_of_study | string? | Current year |
| profile_image | string? | Avatar URL |
| bio | string? | Short bio |
| role | string | user or admin |

### `event_applications`
| Field | Type | Description |
|-------|------|-------------|
| user_id | string | Firebase UID |
| event_id | Id\<events\> | Reference to event |
| is_applied | boolean | Application status |
| applied_at | string | Timestamp |
| reminder_sent | boolean | Whether reminder email was sent |

---

## Contact

- **Admin:** [admin@kapayashwanth.me](mailto:admin@kapayashwanth.me)
- **Team:** [team@eventura.live](mailto:team@eventura.live)

---

## License

This project is proprietary. All rights reserved.
