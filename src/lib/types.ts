// Shared types used across the application (migrated from Supabase types)
// Database is now Convex, Auth is now Firebase

import { Id } from "../../convex/_generated/dataModel";

export interface Event {
  _id: Id<"events">;
  _creationTime: number;
  title: string;
  description: string;
  event_date: string;
  registration_link?: string;
  application_deadline?: string;
  banner_image?: string;
  category:
    | "hackathon"
    | "workshop"
    | "tech-talk"
    | "seminar"
    | "conference"
    | "competition"
    | "webinar"
    | "general";
  status: "past" | "upcoming";
  location?: string;
  organizer?: string;
  max_participants?: number;
  created_by?: string;
}

export interface UserProfile {
  _id: Id<"user_profiles">;
  _creationTime: number;
  firebase_uid: string;
  full_name: string;
  email: string;
  mobile_number?: string;
  department?: string;
  year_of_study?: string;
  profile_image?: string;
  bio?: string;
  role: string;
}

export interface EventApplication {
  _id: Id<"event_applications">;
  _creationTime: number;
  user_id: string;
  event_id: Id<"events">;
  is_applied: boolean;
  applied_at: string;
  reminder_sent: boolean;
}
