// ============ EMAIL TEMPLATES ============
// All email HTML templates used by Eventura

const FOOTER = `
      <div style="padding: 24px 32px; background: #141414; border-top: 1px solid #2a2a2a; text-align: center;">
        <p style="color: #666666; font-size: 12px; margin: 0 0 8px; line-height: 1.6;">Eventura — Campus Event Management</p>
        <p style="margin: 0 0 8px;">
          <a href="mailto:admin@kapayashwanth.me" style="color: #6366f1; font-size: 12px; text-decoration: none;">admin@kapayashwanth.me</a>
          <span style="color: #444444; font-size: 12px;"> &middot; </span>
          <a href="mailto:team@eventura.live" style="color: #6366f1; font-size: 12px; text-decoration: none;">team@eventura.live</a>
        </p>`;

function footerWithNote(note: string): string {
  return `${FOOTER}
        <p style="color: #555555; font-size: 11px; margin: 0;">${note}</p>
      </div>`;
}

function ctaButton(label: string): string {
  return `
        <div style="text-align: center; margin: 0 0 28px;">
          <a href="https://eventura.live" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1, #ec4899); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">${label}</a>
        </div>`;
}

function wrapEmail(headerSubtitle: string, body: string, footerNote: string): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
      <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 36px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">EVENTURA</h1>
        ${headerSubtitle ? `<p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${headerSubtitle}</p>` : ""}
      </div>
      <div style="padding: 36px 32px;">
        ${body}
      </div>
      ${footerWithNote(footerNote)}
    </div>`;
}

export function welcomeEmailHtml(userName: string): string {
  const body = `
        <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Hi ${userName},</p>
        <p style="color: #b0b0b0; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Welcome to Eventura — your platform for discovering and participating in campus events. We're glad to have you on board.
        </p>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 28px; border-left: 3px solid #6366f1;">
          <p style="color: #ffffff; font-weight: 600; margin: 0 0 14px; font-size: 14px;">What you can do:</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px; line-height: 1.5;"><strong style="color: #e0e0e0;">Browse Events</strong> — Discover hackathons, workshops, seminars and more</td></tr>
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px; line-height: 1.5;"><strong style="color: #e0e0e0;">Set Reminders</strong> — Get notified before deadlines</td></tr>
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px; line-height: 1.5;"><strong style="color: #e0e0e0;">Track Applications</strong> — Keep your registrations in one place</td></tr>
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px; line-height: 1.5;"><strong style="color: #e0e0e0;">Complete Your Profile</strong> — Add your details for personalized updates</td></tr>
          </table>
        </div>
        ${ctaButton("Explore Events")}`;
  return wrapEmail("", body, "You received this email because you signed up on Eventura.");
}

export function deadlineReminderEmailHtml(
  userName: string,
  eventTitle: string,
  dateLabel: string,
  formattedDate: string,
  eventTime?: string,
  eventLocation?: string
): string {
  const body = `
        <p style="color: #b0b0b0; font-size: 15px; margin: 0 0 8px;">Hi ${userName},</p>
        <p style="color: #ffffff; font-size: 17px; line-height: 1.6; margin: 0 0 24px;">
          The <strong>${dateLabel.toLowerCase()}</strong> for <strong>${eventTitle}</strong> is tomorrow.
        </p>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 28px; border-left: 3px solid #ec4899;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #ec4899; font-weight: 600; font-size: 14px;">${dateLabel}: ${formattedDate}</td></tr>
            ${eventTime ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Time:</strong> ${eventTime}</td></tr>` : ""}
            ${eventLocation ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Location:</strong> ${eventLocation}</td></tr>` : ""}
          </table>
        </div>
        <p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
          Make sure to complete your registration before the deadline passes.
        </p>
        ${ctaButton("View Event")}`;
  return wrapEmail("Deadline Reminder", body, "You received this email because you set a reminder on Eventura.");
}

export function eventReminderEmailHtml(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime?: string,
  eventLocation?: string,
  eventCategory?: string,
  eventDescription?: string,
  applicationDeadline?: string
): string {
  const body = `
        <p style="color: #b0b0b0; font-size: 15px; margin: 0 0 8px;">Hi ${userName},</p>
        <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 20px; font-weight: 600;">${eventTitle}</h2>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 24px; border-left: 3px solid #6366f1;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Date:</strong> ${eventDate}</td></tr>
            ${eventTime ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Time:</strong> ${eventTime}</td></tr>` : ""}
            ${eventLocation ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Location:</strong> ${eventLocation}</td></tr>` : ""}
            ${eventCategory ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Category:</strong> ${eventCategory}</td></tr>` : ""}
          </table>
        </div>
        ${eventDescription ? `<p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">${eventDescription}</p>` : ""}
        ${applicationDeadline ? `<p style="color: #ec4899; font-weight: 600; font-size: 14px; margin: 0 0 28px;">Application Deadline: ${applicationDeadline}</p>` : ""}
        ${ctaButton("View Details")}`;
  return wrapEmail("Event Reminder", body, "You received this email because you set a reminder on Eventura.");
}

export function newEventNotificationHtml(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime?: string,
  eventLocation?: string,
  eventCategory?: string,
  eventDescription?: string,
  applicationDeadline?: string
): string {
  const body = `
        <p style="color: #b0b0b0; font-size: 15px; margin: 0 0 8px;">Hi ${userName},</p>
        <p style="color: #ffffff; font-size: 17px; line-height: 1.6; margin: 0 0 16px;">
          A new event has been added — take a look.
        </p>
        <h2 style="color: #6366f1; font-size: 20px; margin: 0 0 20px; font-weight: 600;">${eventTitle}</h2>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 24px; border-left: 3px solid #6366f1;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Date:</strong> ${eventDate}</td></tr>
            ${eventTime ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Time:</strong> ${eventTime}</td></tr>` : ""}
            ${eventLocation ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Location:</strong> ${eventLocation}</td></tr>` : ""}
            ${eventCategory ? `<tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Category:</strong> ${eventCategory}</td></tr>` : ""}
          </table>
        </div>
        ${eventDescription ? `<p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">${eventDescription}</p>` : ""}
        ${applicationDeadline ? `<p style="color: #ec4899; font-weight: 600; font-size: 14px; margin: 0 0 28px;">Application Deadline: ${applicationDeadline}</p>` : ""}
        ${ctaButton("View Event")}`;
  return wrapEmail("New Event", body, "You received this email because you're a registered user on Eventura.");
}
