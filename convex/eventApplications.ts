import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============ QUERIES ============

export const getByUser = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("event_applications")
      .withIndex("by_user_applied", (q) =>
        q.eq("user_id", args.user_id).eq("is_applied", true)
      )
      .collect();

    // Enrich with event data
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const event = await ctx.db.get(app.event_id);
        return {
          ...app,
          events: event
            ? {
                title: event.title,
                description: event.description,
                event_date: event.event_date,
                event_time: event.event_time,
                application_deadline: event.application_deadline,
                location: event.location,
                category: event.category,
                banner_image: event.banner_image,
                status: event.status,
              }
            : null,
        };
      })
    );

    return enriched.sort(
      (a, b) =>
        new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    );
  },
});

export const checkStatus = query({
  args: { user_id: v.string(), event_id: v.id("events") },
  handler: async (ctx, args) => {
    const application = await ctx.db
      .query("event_applications")
      .withIndex("by_user_event", (q) =>
        q.eq("user_id", args.user_id).eq("event_id", args.event_id)
      )
      .first();

    return {
      is_applied: application?.is_applied ?? false,
      applied_at: application?.applied_at,
    };
  },
});

export const getCountByEvent = query({
  args: { event_id: v.id("events") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("event_applications")
      .withIndex("by_event", (q) => q.eq("event_id", args.event_id))
      .collect();
    return applications.filter((a) => a.is_applied).length;
  },
});

export const getByEvent = query({
  args: { event_id: v.id("events") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("event_applications")
      .withIndex("by_event", (q) => q.eq("event_id", args.event_id))
      .collect();

    const applied = applications.filter((a) => a.is_applied);

    // Enrich with user profile data
    const enriched = await Promise.all(
      applied.map(async (app) => {
        const profile = await ctx.db
          .query("user_profiles")
          .withIndex("by_firebase_uid", (q) =>
            q.eq("firebase_uid", app.user_id)
          )
          .first();
        return {
          ...app,
          user_profile: profile
            ? {
                full_name: profile.full_name,
                email: profile.email,
                mobile_number: profile.mobile_number,
                department: profile.department,
                year_of_study: profile.year_of_study,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

// ============ MUTATIONS ============

export const toggle = mutation({
  args: { user_id: v.string(), event_id: v.id("events") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("event_applications")
      .withIndex("by_user_event", (q) =>
        q.eq("user_id", args.user_id).eq("event_id", args.event_id)
      )
      .first();

    if (existing) {
      const newStatus = !existing.is_applied;
      await ctx.db.patch(existing._id, {
        is_applied: newStatus,
        applied_at: newStatus ? new Date().toISOString() : existing.applied_at,
      });
      return {
        success: true,
        is_applied: newStatus,
        message: newStatus
          ? "Reminder set! You'll receive email reminders before the event."
          : "Reminder removed.",
      };
    }

    await ctx.db.insert("event_applications", {
      user_id: args.user_id,
      event_id: args.event_id,
      is_applied: true,
      applied_at: new Date().toISOString(),
      reminder_sent: false,
    });

    return {
      success: true,
      is_applied: true,
      message:
        "Reminder set! You'll receive email reminders before the event.",
    };
  },
});

export const remove = mutation({
  args: { id: v.id("event_applications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { is_applied: false });
  },
});

// Get all active reminders that haven't been sent yet
export const getPendingReminders = query({
  args: {},
  handler: async (ctx) => {
    const applications = await ctx.db
      .query("event_applications")
      .collect();

    // Filter to: is_applied=true, reminder_sent=false
    const pending = applications.filter(
      (a) => a.is_applied && !a.reminder_sent
    );

    // Enrich with event and user data
    const enriched = await Promise.all(
      pending.map(async (app) => {
        const event = await ctx.db.get(app.event_id);
        const profile = await ctx.db
          .query("user_profiles")
          .withIndex("by_firebase_uid", (q) =>
            q.eq("firebase_uid", app.user_id)
          )
          .first();
        return {
          ...app,
          event,
          profile,
        };
      })
    );

    return enriched;
  },
});

// Mark a reminder as sent
export const markReminderSent = mutation({
  args: { id: v.id("event_applications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { reminder_sent: true });
  },
});

// Get all users with their reminded events (for admin)
export const getAllUsersWithReminders = query({
  args: {},
  handler: async (ctx) => {
    const allProfiles = await ctx.db.query("user_profiles").collect();
    const allApplications = await ctx.db.query("event_applications").collect();
    const activeApps = allApplications.filter((a) => a.is_applied);

    const usersWithReminders = await Promise.all(
      allProfiles.map(async (profile) => {
        const userApps = activeApps.filter(
          (a) => a.user_id === profile.firebase_uid
        );
        const remindedEvents = await Promise.all(
          userApps.map(async (app) => {
            const event = await ctx.db.get(app.event_id);
            return event
              ? {
                  _id: event._id,
                  title: event.title,
                  event_date: event.event_date,
                  status: event.status,
                  applied_at: app.applied_at,
                }
              : null;
          })
        );
        return {
          _id: profile._id,
          full_name: profile.full_name,
          email: profile.email,
          mobile_number: profile.mobile_number,
          department: profile.department,
          year_of_study: profile.year_of_study,
          role: profile.role,
          reminded_events: remindedEvents.filter(Boolean),
        };
      })
    );

    return usersWithReminders.sort(
      (a, b) => b.reminded_events.length - a.reminded_events.length
    );
  },
});
