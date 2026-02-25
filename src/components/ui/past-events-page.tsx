"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Search, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { EventDetailsModal } from "./event-details-modal";

interface PastEventsPageProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onAboutClick?: () => void;
  onPastEventsClick?: () => void;
  onUpcomingEventsClick?: () => void;
  onContactClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRegisteredEventsClick?: () => void;
  onAdminClick?: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
  userName?: string;
  onEventClick?: (event: any) => void;
}

export function PastEventsPage(props: PastEventsPageProps) {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const events = useQuery(api.events.getByStatus, { status: "past" });

  const filteredEvents = (events || []).filter((event: any) => {
    const q = search.toLowerCase();
    return (
      (event.title || "").toLowerCase().includes(q) ||
      (event.description || "").toLowerCase().includes(q) ||
      (event.location || "").toLowerCase().includes(q) ||
      (event.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar
        onLoginClick={props.onLoginClick}
        onSignupClick={props.onSignupClick}
        onAboutClick={props.onAboutClick}
        onPastEventsClick={props.onPastEventsClick}
        onUpcomingEventsClick={props.onUpcomingEventsClick}
        onContactClick={props.onContactClick}
        onHomeClick={props.onHomeClick}
        onProfileClick={props.onProfileClick}
        onRegisteredEventsClick={props.onRegisteredEventsClick}
        onAdminClick={props.onAdminClick}
        isAuthenticated={props.isAuthenticated}
        isAdmin={props.isAdmin}
        onLogout={props.onLogout}
        userName={props.userName}
      />

      <div className="flex-grow py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Past Events
            </h1>
            <p className="text-white/60 text-sm sm:text-base mb-8">
              Browse events that have already taken place
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search past events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </motion.div>

          {events === undefined ? (
            <div className="text-center py-20 text-white/40">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-6" />
              <p className="text-white/40 text-xl">
                {search ? "No events match your search" : "No past events yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredEvents.map((event: any, index: number) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl blur-xl group-hover:from-white/15 group-hover:via-white/10 transition-all duration-500" />
                  <div className="relative h-full flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/20 group-hover:border-white/30 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-500">
                  {event.banner_image && (
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={event.banner_image}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-gray-500/20 text-gray-200 border border-gray-500/30">
                          past
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-rose-300 transition-all duration-300">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-white/50 text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mb-5 mt-auto">
                      {event.event_date && (
                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                      )}
                      {event.event_time && (
                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {event.event_time}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 text-sm font-medium shadow-lg shadow-indigo-500/25"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onLoginRequired={props.onLoginClick}
        onProfileRequired={props.onProfileClick}
      />

      <Footer />
    </div>
  );
}
