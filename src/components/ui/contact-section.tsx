"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ButtonColorful } from "./button-colorful";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);
    
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formDataObj as any).toString(),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Form submission failed");
      }
    } catch (err) {
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative w-full bg-[#030303] py-16 md:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
              Contact Us
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Get in Touch
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8">
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <div className="space-y-1">
                      <a href="mailto:admin@kapayashwanth.me" className="block text-white/70 hover:text-indigo-400 transition-colors text-sm">
                        admin@kapayashwanth.me
                      </a>
                      <a href="mailto:team@eventura.live" className="block text-white/70 hover:text-indigo-400 transition-colors text-sm">
                        team@eventura.live
                      </a>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Location</h3>
                    <p className="text-white/70 text-sm">
                      Amrita Vishwa Vidyapeetham<br />
                      Nagercoil, Tamil Nadu
                    </p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Response Time</h3>
                    <p className="text-white/70 text-sm">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-white/70 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <input type="hidden" name="form-name" value="contact" />
                  <input type="hidden" name="bot-field" />

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Message *</label>
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <ButtonColorful
                    type="submit"
                    label={submitting ? "Sending..." : "Send Message"}
                    className="w-full"
                    disabled={submitting}
                  />
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
