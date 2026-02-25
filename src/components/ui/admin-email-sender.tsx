"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

const EMAIL_TEMPLATES = [
  { id: "custom", label: "Custom (write your own)" },
  { id: "welcome", label: "Welcome Email" },
  { id: "deadline-reminder", label: "Deadline Reminder" },
  { id: "event-reminder", label: "Event Reminder" },
  { id: "new-event", label: "New Event Notification" },
] as const;

type TemplateId = (typeof EMAIL_TEMPLATES)[number]["id"];

// Inline simple template previews (matching the templates in emailTemplates.ts)
function getTemplateHtml(templateId: TemplateId, params: Record<string, string>): string {
  const name = params.recipientName || "User";
  const eventTitle = params.eventTitle || "Sample Event";
  const eventDate = params.eventDate || new Date().toLocaleDateString();

  const header = (subtitle?: string) => `
    <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 36px 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">EVENTURA</h1>
      ${subtitle ? `<p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${subtitle}</p>` : ""}
    </div>`;

  const ctaBtn = (label: string) => `
    <div style="text-align: center; margin: 0 0 28px;">
      <a href="https://eventura.live" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1, #ec4899); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">${label}</a>
    </div>`;

  const footer = (note: string) => `
    <div style="padding: 24px 32px; background: #141414; border-top: 1px solid #2a2a2a; text-align: center;">
      <p style="color: #666666; font-size: 12px; margin: 0 0 8px; line-height: 1.6;">Eventura — Campus Event Management</p>
      <p style="margin: 0 0 8px;">
        <a href="mailto:admin@kapayashwanth.me" style="color: #6366f1; font-size: 12px; text-decoration: none;">admin@kapayashwanth.me</a>
        <span style="color: #444444; font-size: 12px;"> &middot; </span>
        <a href="mailto:team@eventura.live" style="color: #6366f1; font-size: 12px; text-decoration: none;">team@eventura.live</a>
      </p>
      <p style="color: #555555; font-size: 11px; margin: 0;">${note}</p>
    </div>`;

  const wrap = (headerHtml: string, bodyHtml: string, footerHtml: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
      ${headerHtml}
      <div style="padding: 36px 32px;">${bodyHtml}</div>
      ${footerHtml}
    </div>`;

  switch (templateId) {
    case "welcome":
      return wrap(
        header(),
        `<p style="color: #ffffff; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Hi ${name},</p>
        <p style="color: #b0b0b0; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Welcome to Eventura — your platform for discovering and participating in campus events. We're glad to have you on board.
        </p>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 28px; border-left: 3px solid #6366f1;">
          <p style="color: #ffffff; font-weight: 600; margin: 0 0 14px; font-size: 14px;">What you can do:</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Browse Events</strong> — Discover hackathons, workshops, seminars and more</td></tr>
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Set Reminders</strong> — Get notified before deadlines</td></tr>
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Track Applications</strong> — Keep your registrations in one place</td></tr>
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Complete Your Profile</strong> — Add your details for personalized updates</td></tr>
          </table>
        </div>
        ${ctaBtn("Explore Events")}`,
        footer("You received this email because you signed up on Eventura.")
      );

    case "deadline-reminder":
      return wrap(
        header("Deadline Reminder"),
        `<p style="color: #b0b0b0; font-size: 15px; margin: 0 0 8px;">Hi ${name},</p>
        <p style="color: #ffffff; font-size: 17px; line-height: 1.6; margin: 0 0 24px;">
          The <strong>application deadline</strong> for <strong>${eventTitle}</strong> is tomorrow.
        </p>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 28px; border-left: 3px solid #ec4899;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #ec4899; font-weight: 600; font-size: 14px;">Deadline: ${eventDate}</td></tr>
          </table>
        </div>
        <p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">Make sure to complete your registration before the deadline passes.</p>
        ${ctaBtn("View Event")}`,
        footer("You received this email because you set a reminder on Eventura.")
      );

    case "event-reminder":
      return wrap(
        header("Event Reminder"),
        `<p style="color: #b0b0b0; font-size: 15px; margin: 0 0 8px;">Hi ${name},</p>
        <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 20px; font-weight: 600;">${eventTitle}</h2>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 24px; border-left: 3px solid #6366f1;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Date:</strong> ${eventDate}</td></tr>
          </table>
        </div>
        ${ctaBtn("View Details")}`,
        footer("You received this email because you registered for this event on Eventura.")
      );

    case "new-event":
      return wrap(
        header("New Event"),
        `<p style="color: #b0b0b0; font-size: 15px; margin: 0 0 8px;">Hi ${name},</p>
        <p style="color: #ffffff; font-size: 17px; line-height: 1.6; margin: 0 0 16px;">A new event has been added — take a look.</p>
        <h2 style="color: #6366f1; font-size: 20px; margin: 0 0 20px; font-weight: 600;">${eventTitle}</h2>
        <div style="background: #222222; border-radius: 8px; padding: 20px; margin: 0 0 24px; border-left: 3px solid #6366f1;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #b0b0b0; font-size: 14px;"><strong style="color: #e0e0e0;">Date:</strong> ${eventDate}</td></tr>
          </table>
        </div>
        ${ctaBtn("View Event")}`,
        footer("You received this email because you're a registered user on Eventura.")
      );

    default:
      return "";
  }
}

export function AdminEmailSender() {
  const sendCustomEmail = useAction(api.emails.sendCustomEmail);

  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState<TemplateId>("custom");
  const [customHtml, setCustomHtml] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!toEmail || !subject) {
      setResult({ success: false, message: "Email address and subject are required." });
      return;
    }

    let htmlBody = customHtml;
    if (template !== "custom") {
      htmlBody = getTemplateHtml(template, {
        recipientName: toName || "User",
        eventTitle,
        eventDate,
      });
    }

    if (!htmlBody.trim()) {
      setResult({ success: false, message: "Email body cannot be empty. Write custom HTML or select a template." });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await sendCustomEmail({
        toEmail,
        toName: toName || undefined,
        subject,
        htmlBody,
      });
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Failed to send email." });
    } finally {
      setSending(false);
    }
  };

  const showTemplateParams = template !== "custom";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Mail className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">Send Email</h2>
      </div>
      <p className="text-white/50 text-sm">Send an email to any address using Eventura's email system (ZeptoMail).</p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
        {/* Recipient */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Recipient Email *</label>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Recipient Name</label>
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Template picker */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Email Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateId)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            {EMAIL_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#1a1a1a]">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Template parameters */}
        {showTemplateParams && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-1">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Hackathon 2025"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-1">Event Date</label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="June 15, 2025"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Custom HTML body */}
        {template === "custom" && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">HTML Body *</label>
            <textarea
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
              rows={8}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
            />
          </div>
        )}

        {/* Result banner */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              result.success
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {result.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm">{result.message}</span>
          </motion.div>
        )}

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSend}
          disabled={sending}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Email
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
