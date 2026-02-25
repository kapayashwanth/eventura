import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  welcomeEmailHtml,
  deadlineReminderEmailHtml,
  eventReminderEmailHtml,
  newEventNotificationHtml,
} from "./emailTemplates";

// ============ ZEPTOMAIL HELPER ============

const ZEPTOMAIL_API_URL = "https://api.zeptomail.in/v1.1/email";

interface ZeptoMailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlBody: string;
}

async function sendViaZeptoMail(params: ZeptoMailParams): Promise<{ success: boolean; message: string }> {
  const zeptoMailToken = process.env.ZEPTOMAIL_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "alerts@eventura.live";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Eventura";

  if (!zeptoMailToken) {
    console.log(`[ZeptoMail Preview] Would send "${params.subject}" to ${params.to.map(t => t.email).join(", ")}`);
    return {
      success: true,
      message: `Email logged (no ZEPTOMAIL_TOKEN configured). Would send to ${params.to.map(t => t.email).join(", ")}`,
    };
  }

  try {
    const response: Response = await fetch(ZEPTOMAIL_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": zeptoMailToken.startsWith("Zoho-enczapikey") ? zeptoMailToken : `Zoho-enczapikey ${zeptoMailToken}`,
      },
      body: JSON.stringify({
        from: { address: fromEmail, name: fromName },
        to: params.to.map(t => ({
          email_address: { address: t.email, name: t.name || t.email },
        })),
        subject: params.subject,
        htmlbody: params.htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ZeptoMail API error:", errorText);
      return { success: false, message: `ZeptoMail API error: ${response.status} — ${errorText}` };
    }

    return { success: true, message: `Email sent to ${params.to.map(t => t.email).join(", ")}` };
  } catch (error: any) {
    console.error("ZeptoMail sending failed:", error);
    return { success: false, message: error.message || "Email sending failed" };
  }
}

// ============ PUBLIC ACTIONS ============

/**
 * Send a reminder email to a user about an event (triggered manually).
 * Uses ZeptoMail by Zoho for email delivery.
 * Set ZEPTOMAIL_TOKEN in Convex environment variables.
 */
export const sendReminder = action({
  args: {
    user_id: v.string(),
    event_id: v.id("events"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const profile: any = await ctx.runQuery(api.userProfiles.getByFirebaseUid, {
      firebase_uid: args.user_id,
    });

    if (!profile || !profile.email) {
      return { success: false, message: "User not found or no email" };
    }

    const event: any = await ctx.runQuery(api.events.getById, { id: args.event_id });
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const eventDate = event.event_date
      ? new Date(event.event_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "TBA";

    const htmlBody = eventReminderEmailHtml(
      profile.full_name,
      event.title,
      eventDate,
      event.event_time,
      event.location,
      event.category,
      event.description,
      event.application_deadline
        ? new Date(event.application_deadline).toLocaleDateString()
        : undefined
    );

    return await sendViaZeptoMail({
      to: [{ email: profile.email, name: profile.full_name }],
      subject: `Reminder: ${event.title} — ${eventDate}`,
      htmlBody,
    });
  },
});

// ============ INTERNAL ACTIONS (called via scheduler) ============

/**
 * Send welcome email to a newly registered user.
 * Called internally after profile creation via scheduler.
 */
export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const htmlBody = welcomeEmailHtml(args.fullName);

    const result = await sendViaZeptoMail({
      to: [{ email: args.email, name: args.fullName }],
      subject: `Welcome to Eventura, ${args.fullName}! 🎉`,
      htmlBody,
    });

    console.log(`Welcome email to ${args.email}: ${result.message}`);
  },
});

/**
 * Notify all registered users when a new event is added.
 * Called internally after event creation via scheduler.
 */
export const sendNewEventNotification = internalAction({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<void> => {
    const event: any = await ctx.runQuery(api.events.getById, { id: args.eventId });
    if (!event || event.status !== "upcoming") {
      console.log("Event not found or not upcoming, skipping notification.");
      return;
    }

    const allProfiles: any[] = await ctx.runQuery(api.userProfiles.getAll);
    if (!allProfiles || allProfiles.length === 0) {
      console.log("No users to notify.");
      return;
    }

    const eventDate = event.event_date
      ? new Date(event.event_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "TBA";

    const deadlineStr = event.application_deadline
      ? new Date(event.application_deadline).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : undefined;

    let sentCount = 0;

    for (const profile of allProfiles) {
      if (!profile.email) continue;

      const htmlBody = newEventNotificationHtml(
        profile.full_name,
        event.title,
        eventDate,
        event.event_time,
        event.location,
        event.category,
        event.description,
        deadlineStr
      );

      const result = await sendViaZeptoMail({
        to: [{ email: profile.email, name: profile.full_name }],
        subject: `🆕 New Event: ${event.title}`,
        htmlBody,
      });

      if (result.success) sentCount++;
    }

    console.log(`New event notification sent to ${sentCount}/${allProfiles.length} users for "${event.title}".`);
  },
});

/**
 * Send reminder emails for events whose deadline is within the next 24 hours.
 * Called by cron job every hour.
 */
export const sendUpcomingReminders = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; message: string }> => {
    console.log("Checking for upcoming event reminders...");

    const pendingReminders: any[] = await ctx.runQuery(
      api.eventApplications.getPendingReminders,
      {}
    );

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log("No pending reminders found.");
      return { success: true, message: "No pending reminders." };
    }

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let sentCount = 0;

    for (const reminder of pendingReminders) {
      const event = reminder.event;
      const profile = reminder.profile;

      if (!event || !profile || !profile.email) continue;

      const deadline = event.application_deadline
        ? new Date(event.application_deadline)
        : null;
      const eventDate = event.event_date ? new Date(event.event_date) : null;
      const targetDate = deadline || eventDate;

      if (!targetDate) continue;

      // Send reminder if the target date is within the next 24 hours (and not already past)
      if (targetDate >= now && targetDate <= oneDayFromNow) {
        const dateLabel = deadline ? "Application Deadline" : "Event Date";
        const formattedDate = targetDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const htmlBody = deadlineReminderEmailHtml(
          profile.full_name,
          event.title,
          dateLabel,
          formattedDate,
          event.event_time,
          event.location
        );

        const result = await sendViaZeptoMail({
          to: [{ email: profile.email, name: profile.full_name }],
          subject: `⏰ Tomorrow: ${event.title} — ${dateLabel}`,
          htmlBody,
        });

        if (!result.success) {
          console.error(`Failed to send to ${profile.email}: ${result.message}`);
          continue;
        }

        // Mark as sent
        await ctx.runMutation(api.eventApplications.markReminderSent, {
          id: reminder._id,
        });
        sentCount++;
      }
    }

    console.log(`Sent ${sentCount} deadline reminder(s).`);
    return {
      success: true,
      message: `Sent ${sentCount} deadline reminder(s).`,
    };
  },
});

// ============ ADMIN: SEND CUSTOM EMAIL ============

/**
 * Send a custom email from the admin panel to any address.
 */
export const sendCustomEmail = action({
  args: {
    toEmail: v.string(),
    toName: v.optional(v.string()),
    subject: v.string(),
    htmlBody: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string }> => {
    return await sendViaZeptoMail({
      to: [{ email: args.toEmail, name: args.toName || args.toEmail }],
      subject: args.subject,
      htmlBody: args.htmlBody,
    });
  },
});
