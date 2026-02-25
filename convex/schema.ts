import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    event_date: v.string(),
    event_time: v.optional(v.string()),
    registration_link: v.optional(v.string()),
    application_deadline: v.optional(v.string()),
    banner_image: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("hackathon"),
      v.literal("workshop"),
      v.literal("tech-talk"),
      v.literal("seminar"),
      v.literal("conference"),
      v.literal("competition"),
      v.literal("webinar"),
      v.literal("general")
    )),
    status: v.union(v.literal("past"), v.literal("upcoming"), v.literal("cancelled")),
    location: v.optional(v.string()),
    organizer: v.optional(v.string()),
    max_participants: v.optional(v.number()),
    created_by: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_status_date", ["status", "event_date"]),

  user_profiles: defineTable({
    firebase_uid: v.string(),
    full_name: v.string(),
    email: v.string(),
    mobile_number: v.optional(v.string()),
    department: v.optional(v.string()),
    year_of_study: v.optional(v.string()),
    profile_image: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.string(),
  })
    .index("by_firebase_uid", ["firebase_uid"])
    .index("by_email", ["email"]),

  event_applications: defineTable({
    user_id: v.string(),
    event_id: v.id("events"),
    is_applied: v.boolean(),
    applied_at: v.string(),
    reminder_sent: v.boolean(),
  })
    .index("by_user", ["user_id"])
    .index("by_event", ["event_id"])
    .index("by_user_event", ["user_id", "event_id"])
    .index("by_user_applied", ["user_id", "is_applied"]),
});
