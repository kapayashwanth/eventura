"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight, Users, Eye } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EventDetailsModal } from "./event-details-modal";
import { EventRegistrationButton } from "./event-registration-button";

interface EventsSectionProps {
  onViewAllUpcoming?: () => void;
  onViewAllPast?: () => void;
  onEventClick?: (event: any) => void;
  onLoginRequired?: () => void;
  onProfileRequired?: () => void;
}

export function EventsSection({ onViewAllUpcoming, onViewAllPast, onEventClick, onLoginRequired, onProfileRequired }: EventsSectionProps) {
  const upcomingEvents = useQuery(api.events.getByStatus, { status: "upcoming" });
  const pastEvents = useQuery(api.events.getByStatus, { status: "past" });
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const displayUpcoming = (upcomingEvents || []).slice(0, 3);
  const displayPast = (pastEvents || []).slice(0, 3);

  const handleViewDetails = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  const EventCard = ({ event, index }: { event: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative cursor-pointer ${event.status === 'past' ? 'grayscale hover:grayscale-0' : ''}`}
    >
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl blur-xl group-hover:from-white/15 group-hover:via-white/10 transition-all duration-500" />
      
      <div className="relative h-full flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/20 group-hover:border-white/30 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-500">
        {event.banner_image && (
          <div className="relative h-48 overflow-hidden flex-shrink-0">
            <img
              src={event.banner_image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                event.status === 'upcoming'
                  ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
              }`}>
                {event.status}
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
          <div className="flex gap-2">
            <button
              onClick={(e) => handleViewDetails(event, e)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 text-sm font-medium shadow-lg shadow-indigo-500/25"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            {event.status === 'upcoming' && (
              <div onClick={(e) => e.stopPropagation()}>
                <EventRegistrationButton eventId={event._id} onLoginRequired={onLoginRequired} onProfileRequired={onProfileRequired} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Upcoming Events */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">Upcoming Events</span>
            </h2>
            <p className="text-white/50 text-sm md:text-base">Don't miss out on these events</p>
          </div>
          <div className="flex justify-end mb-6">
            <button
              onClick={onViewAllUpcoming}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {upcomingEvents === undefined ? (
            <div className="text-center py-12 text-white/40">Loading events...</div>
          ) : displayUpcoming.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No upcoming events at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayUpcoming.map((event: any, i: number) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div id="past-events">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">Past Events</span>
            </h2>
            <p className="text-white/50 text-sm md:text-base">Events that have already taken place</p>
          </div>
          <div className="flex justify-end mb-6">
            <button
              onClick={onViewAllPast}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {pastEvents === undefined ? (
            <div className="text-center py-12 text-white/40">Loading events...</div>
          ) : displayPast.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No past events yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayPast.map((event: any, i: number) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onLoginRequired={onLoginRequired}
        onProfileRequired={onProfileRequired}
      />
    </section>
  );
}
