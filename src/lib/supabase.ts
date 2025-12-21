import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are not provided
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Will be handled by components

// Types for TypeScript
export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  registration_link?: string;
  application_deadline?: string;
  banner_image?: string;
  category: 'hackathon' | 'workshop' | 'tech-talk' | 'seminar' | 'conference' | 'competition' | 'webinar' | 'general';
  status: 'past' | 'upcoming';
  location?: string;
  organizer?: string;
  max_participants?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}
