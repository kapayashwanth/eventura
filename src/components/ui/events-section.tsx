"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, MapPin, ExternalLink, Users, User, Eye } from "lucide-react";
import { supabase, Event } from "@/lib/supabase";
import { EventBanner } from "./event-banner";
import { ButtonColorful } from "./button-colorful";
import { EventDetailsModal } from "./event-details-modal";

interface EventsSectionProps {
  onViewUpcoming?: () => void;
  onViewPast?: () => void;
}

export function EventsSection({ onViewUpcoming, onViewPast }: EventsSectionProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is configured
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      // Fetch upcoming events
      const { data: upcoming, error: upcomingError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true });

      if (upcomingError) throw upcomingError;

      // Fetch past events
      const { data: past, error: pastError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'past')
        .order('event_date', { ascending: false });

      if (pastError) throw pastError;

      setUpcomingEvents(upcoming || []);
      setPastEvents(past || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedUpcoming = showAllUpcoming ? upcomingEvents : upcomingEvents.slice(0, 6);
  const displayedPast = showAllPast ? pastEvents : pastEvents.slice(0, 6);

  if (loading) {
    return (
      <section className="relative min-h-screen w-full bg-[#030303] py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white/50 text-lg">
              {!supabase ? (
                <div className="text-center">
                  <p className="mb-2">⚠️ Supabase is not configured yet</p>
                  <p className="text-sm">Please follow SUPABASE_SETUP.md to set up your database</p>
                </div>
              ) : (
                'Loading events...'
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen w-full bg-[#030303] py-12 md:py-20" id="upcoming-events">
      <div className="container mx-auto px-4 md:px-6">
        {/* Hero Banner */}
        {upcomingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-24"
          >
            <EventBanner events={upcomingEvents.slice(0, 5)} />
          </motion.div>
        )}

        {/* Upcoming Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
              Upcoming Events
            </h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <p className="text-lg">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {displayedUpcoming.map((event, index) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    index={index} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Always show View More button to navigate to dedicated page */}
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onViewUpcoming}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View More Upcoming Events
                </motion.button>
              </div>
            </>
          )}
        </motion.div>

        {/* Past Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="past-events"
        >
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-indigo-300">
              Past Events
            </h2>
          </div>

          {pastEvents.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <p className="text-lg">No past events to display.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {displayedPast.map((event, index) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    index={index} 
                    isPast 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Always show View More button to navigate to dedicated page */}
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onViewPast}
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View More Past Events
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}

function EventCard({ 
  event, 
  index, 
  isPast = false,
  onViewDetails 
}: { 
  event: Event; 
  index: number; 
  isPast?: boolean;
  onViewDetails: (event: Event) => void;
}) {
  const eventDate = new Date(event.event_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className={`group relative h-full flex flex-col ${isPast ? 'grayscale hover:grayscale-0' : ''}`}
      style={{ transition: 'filter 0.5s ease' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
      
      <div className={`relative bg-white/[0.02] backdrop-blur-sm border border-white/10 group-hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col ${isPast ? 'opacity-70 group-hover:opacity-100' : ''}`}>
        {/* Banner Image */}
        {event.banner_image ? (
          <div className="relative h-48 sm:h-56 overflow-hidden bg-black/20 flex-shrink-0">
            <img
              src={event.banner_image}
              alt={event.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
              <span className="px-2 sm:px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-sm text-white text-xs font-medium uppercase">
                {event.category}
              </span>
            </div>

            {/* Status Badge */}
            {isPast && (
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <span className="px-2 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                  Completed
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 sm:h-56 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0">
            <div className="text-white/30 text-3xl sm:text-4xl font-bold">{event.category.toUpperCase()}</div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-rose-300 transition-all duration-300 line-clamp-2">
            {event.title}
          </h3>

          <p className="text-white/60 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2 flex-grow">
            {event.description}
          </p>

          {/* Meta Info */}
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.organizer && (
              <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{event.organizer}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
            <button
              onClick={() => onViewDetails(event)}
              className="flex-1 group/view relative px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border border-indigo-300/30 hover:border-rose-300/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 opacity-0 group-hover/view:opacity-100 transition-opacity duration-300" />
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-300 group-hover/view:text-rose-300 transition-colors relative z-10" />
              <span className="text-xs sm:text-sm font-medium text-white relative z-10">View Details</span>
            </button>
            
            {event.registration_link && !isPast && (
              <ButtonColorful
                label="Register"
                onClick={() => window.open(event.registration_link, '_blank')}
                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
