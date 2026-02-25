"use client";

import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#030303] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">About</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Your gateway to endless opportunities at Amrita Vishwa Vidyapeetham. 
              Never miss an event, workshop, or learning experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-white/60 hover:text-white text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-white/60 hover:text-white text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#upcoming-events" className="text-white/60 hover:text-white text-sm transition-colors">
                  Upcoming Events
                </a>
              </li>
              <li>
                <a href="#past-events" className="text-white/60 hover:text-white text-sm transition-colors">
                  Past Events
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/60 hover:text-white text-sm transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <div className="space-y-0.5">
                    <a href="mailto:admin@kapayashwanth.me" className="block text-white hover:text-indigo-400 text-sm transition-colors">
                      admin@kapayashwanth.me
                    </a>
                    <a href="mailto:team@eventura.live" className="block text-white hover:text-indigo-400 text-sm transition-colors">
                      team@eventura.live
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-white/60 text-sm">Location</p>
                  <p className="text-white text-sm">
                    Amrita Vishwa Vidyapeetham<br />
                    Nagercoil, Tamil Nadu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {currentYear} Eventura. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
