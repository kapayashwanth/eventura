"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ButtonColorful } from "./button-colorful";
import { EventDetailsModal } from "./event-details-modal";
import { Eye } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  registration_link?: string;
  banner_image?: string;
  category: string;
  location?: string;
  organizer?: string;
  max_participants?: number;
}

interface UpcomingEventsPageProps {
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

export function UpcomingEventsPage({ 
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
}: UpcomingEventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...new Set(events.map(e => e.category))];
  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events.filter(e => e.category === selectedCategory);

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
      <div className="max-w-7xl mx-auto px-4 md:px-8">
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Upcoming Events
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Don't miss out on exciting opportunities coming your way
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-3 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="mt-4 text-white/70">Loading upcoming events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-white/70">No upcoming events at the moment</p>
            <p className="mt-2 text-white/50">Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full"
              >
                {/* Event Image */}
                {event.banner_image && (
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-black/20 flex-shrink-0">
                    <img
                      src={event.banner_image}
                      alt={event.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <span className="px-2 sm:px-3 py-1 bg-indigo-500/80 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
                        {event.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Event Content */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                    {event.event_date && (
                      <div className="flex items-center gap-2 text-white/60">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-white/60">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {event.organizer && (
                      <div className="flex items-center gap-2 text-white/60">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{event.organizer}</span>
                      </div>
                    )}

                    {event.max_participants && (
                      <div className="flex items-center gap-2 text-white/60">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="truncate">Max: {event.max_participants} participants</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="flex-1 group/view relative px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border border-indigo-300/30 hover:border-rose-300/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 opacity-0 group-hover/view:opacity-100 transition-opacity duration-300" />
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-300 group-hover/view:text-rose-300 transition-colors relative z-10" />
                      <span className="text-xs sm:text-sm font-medium text-white relative z-10">View Details</span>
                    </button>
                    
                    {event.registration_link && (
                      <ButtonColorful
                        label="Register"
                        onClick={() => window.open(event.registration_link, '_blank')}
                        className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>
      
      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <Footer />
    </div>
  );
}
