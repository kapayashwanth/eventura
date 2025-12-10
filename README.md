# Amrita Careers - Campus Events Platform

A modern, full-stack web application for managing and discovering campus events at Amrita Vishwa Vidyapeetham, Nagercoil Campus. Built with React, TypeScript, and Supabase.

![Amrita Careers](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## 🌟 Features

### For Students
- 📅 **Browse Events**: Discover upcoming hackathons, workshops, seminars, and tech talks
- 🔍 **Smart Categorization**: Events automatically categorized as upcoming or past
- 👤 **User Profiles**: Complete profile management with image upload
- 🎨 **Beautiful UI**: Modern glass-morphism design with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🔔 **Event Details**: View comprehensive event information in interactive modals

### For Admins
- ➕ **Event Management**: Create, edit, and delete events with ease
- 📊 **Dashboard Analytics**: Overview of total, upcoming, and past events
- 👥 **User Management**: View all registered users
- 🖼️ **Image Upload**: Upload event banners with preview
- ⚡ **Real-time Updates**: Changes reflect immediately across the platform

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works)
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/kapayashwanth/amritacareers.git
cd amritacareers
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy your `Project URL` and `anon/public key`

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set up database schema

Run the following SQL in your Supabase SQL Editor:

<details>
<summary>Click to expand SQL schema</summary>

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    mobile_number TEXT,
    department TEXT,
    year_of_study TEXT,
    profile_image TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    registration_link TEXT,
    banner_image TEXT,
    category TEXT NOT NULL CHECK (category IN ('hackathon', 'workshop', 'tech-talk', 'seminar', 'conference', 'competition', 'webinar', 'general')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
    location TEXT,
    organizer TEXT,
    max_participants INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations Table
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    UNIQUE(event_id, user_id)
);

-- Event Images Table
CREATE TABLE public.event_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- RLS Policies for event_registrations
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own registrations" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_images
CREATE POLICY "Anyone can view event images" ON public.event_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage event images" ON public.event_images FOR ALL USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

</details>

### 6. Set up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create two public buckets:
   - `event-banners` (for event banner images)
   - `profile-images` (for user profile pictures)
3. Set both buckets to **Public** access

### 7. Create your first admin user

After signing up in the app, run this SQL to make yourself an admin:

```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 8. Run the development server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🎯 Usage

### For Students

1. **Sign Up**: Create an account with your email
2. **Complete Profile**: Add mobile number, department, and year
3. **Browse Events**: Explore upcoming and past events
4. **View Details**: Click on any event to see full details
5. **Register**: Click "Register" to sign up for events

### For Admins

1. **Access Admin Panel**: Navigate to `yoursite.com/#admin`
2. **Create Events**: Click "Create Event" and fill in details
3. **Manage Events**: Edit or delete existing events
4. **View Users**: See all registered users

## 🎨 Features Highlight

- **Grayscale Past Events**: Past events appear in grayscale and gain color on hover
- **Automatic Status**: Events automatically categorized based on date
- **Profile Completion**: Users must complete their profile before full access
- **Responsive Navbar**: Beautiful dropdown menu for authenticated users
- **Smooth Animations**: Framer Motion animations throughout the app
- **Cursor-Tracking Effects**: Interactive button animations

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Admin-only access for event management
- Secure authentication via Supabase Auth
- Email verification for new users

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For support or queries, reach out to:
- Email: support@myamrita.me
- Email: careers@myamrita.me

## 📄 License

This project is licensed under the MIT License.

## 🏫 About

Developed for **Amrita Vishwa Vidyapeetham, Nagercoil Campus** to help students discover and participate in campus events, workshops, and opportunities.

---

Made with ❤️ by the Amrita Developer Community
