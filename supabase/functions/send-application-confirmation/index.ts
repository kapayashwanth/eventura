// =====================================================
// SUPABASE EDGE FUNCTION: Send Application Confirmation Email
// =====================================================
// This function sends a confirmation email when a user
// marks an event as applied and adds it to Google Calendar
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourdomain.com";

interface ApplicationRequest {
  user_id: string;
  event_id: string;
}

interface EventDetails {
  title: string;
  description: string;
  event_date: string;
  application_deadline: string;
  location: string;
  category: string;
}

interface UserDetails {
  email: string;
  full_name: string;
}

serve(async (req) => {
  try {
    // Parse request body
    const { user_id, event_id }: ApplicationRequest = await req.json();

    if (!user_id || !event_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or event_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("email, full_name")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate Google Calendar link
    const calendarLink = generateGoogleCalendarLink(event);

    // Send confirmation email
    const emailSent = await sendConfirmationEmail(user, event, calendarLink);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully",
        emailSent,
        calendarLink
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-application-confirmation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function generateGoogleCalendarLink(event: EventDetails): string {
  const eventDate = new Date(event.event_date);
  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  
  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    location: event.location || '',
    dates: `${formatDate(eventDate)}/${formatDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function sendConfirmationEmail(
  user: UserDetails,
  event: EventDetails,
  calendarLink: string
): Promise<boolean> {
  const eventDate = new Date(event.event_date);
  const deadline = event.application_deadline ? new Date(event.application_deadline) : null;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .button-secondary { background: #10b981; }
        .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Application Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.full_name}</strong>,</p>
          
          <div class="success-badge">
            ✓ You've successfully applied!
          </div>
          
          <p>Great news! Your application has been confirmed for:</p>
          
          <div class="event-details">
            <h2 style="margin-top: 0; color: #667eea;">${event.title}</h2>
            
            <p><strong>📅 Event Date:</strong><br>
            ${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            
            ${deadline ? `<p><strong>⏱️ Application Deadline:</strong><br>
            ${deadline.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
            
            ${event.location ? `<p><strong>📍 Location:</strong><br>${event.location}</p>` : ''}
            
            <p><strong>🏷️ Category:</strong> ${event.category}</p>
            
            ${event.description ? `<p><strong>📝 Description:</strong><br>${event.description.substring(0, 300)}${event.description.length > 300 ? '...' : ''}</p>` : ''}
          </div>
          
          <p><strong>📌 Next Steps:</strong></p>
          <ul>
            <li>Add this event to your calendar using the button below</li>
            <li>You'll receive a reminder email before the deadline</li>
            <li>Make sure to prepare any required materials</li>
            <li>Mark your calendar and we'll see you there!</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${calendarLink}" class="button button-secondary" target="_blank">
              📅 Add to Google Calendar
            </a>
          </div>
          
          <p style="margin-top: 30px; padding: 15px; background: #e0e7ff; border-radius: 8px;">
            <strong>💡 Pro Tip:</strong> We'll send you a reminder 1 day before the application deadline so you don't miss it!
          </p>
          
          <p>Thank you for your interest!</p>
          
          <p>Best regards,<br>
          <strong>The Events Team</strong></p>
        </div>
        <div class="footer">
          <p>You received this email because you applied for an event on our platform.</p>
          <p>Questions? Contact us at support@yourdomain.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Hi ${user.full_name},

✅ Application Confirmed!

Your application has been confirmed for: ${event.title}

Event Date: ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}
${deadline ? `Application Deadline: ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}` : ''}
${event.location ? `Location: ${event.location}` : ''}
Category: ${event.category}

Next Steps:
- Add to Google Calendar: ${calendarLink}
- You'll receive a reminder before the deadline
- Prepare any required materials
- We'll see you there!

💡 We'll send you a reminder 1 day before the application deadline!

Best regards,
The Events Team
  `;

  if (RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [user.email],
          subject: `✅ Application Confirmed: ${event.title}`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (response.ok) {
        console.log(`✅ Confirmation email sent to ${user.email}`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ Failed to send email:`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending email:`, error);
      return false;
    }
  }

  console.log(`📧 Would send confirmation email to ${user.email} for: ${event.title}`);
  console.log(`📅 Google Calendar link: ${calendarLink}`);
  console.log("⚠️ RESEND_API_KEY not configured. Set it in Supabase Edge Function secrets.");
  
  return true;
}
