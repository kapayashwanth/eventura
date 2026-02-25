import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ============ QUERIES ============

export const getByStatus = query({
  args: { status: v.union(v.literal("past"), v.literal("upcoming")) },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    // Sort: upcoming ascending, past descending
    return events.sort((a, b) => {
      const dateA = new Date(a.event_date).getTime();
      const dateB = new Date(b.event_date).getTime();
      return args.status === "upcoming" ? dateA - dateB : dateB - dateA;
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    return events.sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ============ MUTATIONS ============

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", args);

    // If the event is upcoming, notify all users about the new event
    if (args.status === "upcoming") {
      await ctx.scheduler.runAfter(0, internal.emails.sendNewEventNotification, {
        eventId,
      });
    }

    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
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
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Automatically transition upcoming events to past when their deadline/event date has passed
export const autoTransitionPastEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const upcomingEvents = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .collect();

    const now = new Date();
    let transitioned = 0;

    for (const event of upcomingEvents) {
      // Use application_deadline first, fall back to event_date
      const deadlineStr = event.application_deadline || event.event_date;
      if (!deadlineStr) continue;

      const deadline = new Date(deadlineStr);
      if (deadline < now) {
        await ctx.db.patch(event._id, { status: "past" as const });
        transitioned++;
      }
    }

    return { transitioned };
  },
});
