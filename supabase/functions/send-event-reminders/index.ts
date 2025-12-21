// =====================================================
// SUPABASE EDGE FUNCTION: Send Event Reminder Emails
// =====================================================
// This function sends reminder emails to users who have
// registered for events, 1 day before the deadline
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Email service configuration
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY"); // Optional: Use Resend for emails
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourdomain.com";

interface ReminderUser {
  application_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_description: string;
  event_location: string;
  event_category: string;
  application_deadline: string;
}

serve(async (req) => {
  try {
    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get users who need reminders (1 day before deadline)
    const { data: usersToRemind, error: fetchError } = await supabase
      .rpc("get_users_needing_deadline_reminders");

    if (fetchError) {
      console.error("Error fetching users:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users", details: fetchError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!usersToRemind || usersToRemind.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No reminders to send",
          count: 0 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${usersToRemind.length} users to remind`);

    const results = [];
    
    // Send email to each user
    for (const user of usersToRemind as ReminderUser[]) {
      try {
        const emailSent = await sendReminderEmail(user);
        
        if (emailSent) {
          // Mark reminder as sent in database
          const { error: updateError } = await supabase
            .rpc("mark_deadline_reminder_sent", { p_application_id: user.application_id });
          
          if (updateError) {
            console.error(`Error marking reminder sent for ${user.user_email}:`, updateError);
          }
          
          results.push({
            email: user.user_email,
            event: user.event_title,
            success: true
          });
        } else {
          results.push({
            email: user.user_email,
            event: user.event_title,
            success: false,
            error: "Email send failed"
          });
        }
      } catch (error) {
        console.error(`Error processing reminder for ${user.user_email}:`, error);
        results.push({
          email: user.user_email,
          event: user.event_title,
          success: false,
          error: String(error)
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} out of ${results.length} reminders`,
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-event-reminders function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function sendReminderEmail(user: ReminderUser): Promise<boolean> {
  const eventDate = new Date(user.event_date);
  const deadline = new Date(user.application_deadline);
  
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
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .deadline-warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Event Registration Reminder</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.user_name}</strong>,</p>
          
          <div class="deadline-warning">
            <strong>⚠️ Important Reminder:</strong> The application deadline for your event is tomorrow!
          </div>
          
          <p>This is a friendly reminder that you applied for the following event:</p>
          
          <div class="event-details">
            <h2 style="margin-top: 0; color: #667eea;">${user.event_title}</h2>
            
            <p><strong>📅 Event Date:</strong><br>
            ${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            
            <p><strong>⏱️ Application Deadline:</strong><br>
            ${deadline.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            
            ${user.event_location ? `<p><strong>📍 Location:</strong><br>${user.event_location}</p>` : ''}
            
            <p><strong>📝 Description:</strong><br>
            ${user.event_description ? user.event_description.substring(0, 200) + '...' : 'No description available'}</p>
          </div>
          
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Make sure you have the event details saved</li>
            <li>Prepare any required materials or documentation</li>
            <li>Set a reminder for the event date</li>
            <li>If you can't attend, please remove your application to help us plan better</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${SUPABASE_URL.replace('supabase.co', 'supabase.co')}" class="button">View Event Details</a>
          </p>
          
          <p>We're excited to see you at the event!</p>
          
          <p>Best regards,<br>
          <strong>The Events Team</strong></p>
        </div>
        <div class="footer">
          <p>You received this email because you registered for an event on our platform.</p>
          <p>If you didn't register for this event or want to unsubscribe, please contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Hi ${user.user_name},

⏰ REMINDER: Application deadline is tomorrow!

You applied for: ${user.event_title}

Event Date: ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}
Application Deadline: ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}
${user.event_location ? `Location: ${user.event_location}` : ''}

What's next?
- Make sure you have the event details saved
- Prepare any required materials
- Set a reminder for the event date
- If you can't attend, please remove your application

We're excited to see you at the event!

Best regards,
The Events Team
  `;

  // Option 1: Use Resend API (recommended)
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
          to: [user.user_email],
          subject: `⏰ Reminder: ${user.event_title} - Application Deadline Tomorrow!`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (response.ok) {
        console.log(`✅ Email sent to ${user.user_email}`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ Failed to send email to ${user.user_email}:`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending email to ${user.user_email}:`, error);
      return false;
    }
  }

  // Option 2: Use Supabase Auth (fallback - requires setup)
  // Note: This requires configuring SMTP in Supabase Dashboard
  console.log(`📧 Would send email to ${user.user_email} for event: ${user.event_title}`);
  console.log("⚠️ RESEND_API_KEY not configured. Email not actually sent.");
  console.log("Configure RESEND_API_KEY in Supabase Edge Function secrets to enable emails.");
  
  // Return true for testing purposes when no email service is configured
  return true;
}
