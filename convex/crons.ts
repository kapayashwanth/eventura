import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Check every hour for events with deadlines in the next 24 hours
// and send reminder emails to users who set reminders
crons.interval(
  "send deadline reminders",
  { hours: 1 },
  api.emails.sendUpcomingReminders
);

// Every hour, auto-transition upcoming events to past when deadline/event date has passed
crons.interval(
  "auto transition past events",
  { hours: 1 },
  api.events.autoTransitionPastEvents
);

export default crons;
