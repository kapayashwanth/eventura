"use client";

import { motion } from "framer-motion";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface AboutUsPageProps {
  onBack?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onAboutClick?: () => void;
  onPastEventsClick?: () => void;
  onUpcomingEventsClick?: () => void;
  onContactClick?: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export function AboutUsPage({ 
  onBack, 
  onLoginClick,
  onSignupClick,
  onAboutClick,
  onPastEventsClick,
  onUpcomingEventsClick,
  onContactClick,
  isAuthenticated,
  onLogout,
  userName
}: AboutUsPageProps) {
  return (
    <div className="min-h-screen w-full bg-[#030303] text-white">
      <Navbar 
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onAboutClick={onAboutClick}
        onPastEventsClick={onPastEventsClick}
        onUpcomingEventsClick={onUpcomingEventsClick}
        onContactClick={onContactClick}
        onHomeClick={onBack}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        userName={userName}
      />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Back Button */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </motion.button>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              About Us
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Empowering students to discover and seize opportunities that shape their future
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Our Mission
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-4">
              At Amrita Vishwa Vidyapeetham, we believe that every opportunity matters. Our platform is dedicated to ensuring that no student misses out on valuable events, workshops, competitions, and learning experiences.
            </p>
            <p className="text-lg text-white/80 leading-relaxed">
              We bridge the gap between opportunity and action, making it easy for students to discover, register, and participate in events that align with their interests and career goals.
            </p>
          </div>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "📅",
                title: "Event Aggregation",
                description: "We gather all campus events, workshops, and opportunities in one centralized platform."
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                description: "Get timely updates about events that match your interests and academic pursuits."
              },
              {
                icon: "🎯",
                title: "Easy Registration",
                description: "One-click access to event registration and participation details."
              },
              {
                icon: "📊",
                title: "Track Your Journey",
                description: "Keep track of events you've attended and opportunities you've explored."
              },
              {
                icon: "🤝",
                title: "Community Building",
                description: "Connect with like-minded peers and build your professional network."
              },
              {
                icon: "💡",
                title: "Career Growth",
                description: "Access opportunities that enhance your skills and boost your career prospects."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-white/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-indigo-500/10 to-rose-500/10 border border-indigo-500/20 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Why Choose Our Platform?
            </h2>
            <ul className="space-y-4">
              {[
                "Comprehensive event coverage across all departments and interests",
                "Real-time updates and notifications for upcoming opportunities",
                "User-friendly interface designed for students, by students",
                "Verified and authentic event information directly from organizers",
                "Personalized recommendations based on your profile and interests",
                "Mobile-responsive design - access opportunities on any device"
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3 text-lg text-white/80"
                >
                  <svg className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Explore Opportunities?
            </h2>
            <p className="text-lg text-white/70 mb-6 max-w-2xl mx-auto">
              Join thousands of students who are already making the most of their college experience
            </p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Browse Events
            </button>
          </div>
        </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
