"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Clock, Tag, Users, ExternalLink } from "lucide-react";
import { EventRegistrationButton } from "./event-registration-button";

interface Event {
  _id: string;
  title: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  status?: string;
  category?: string;
  banner_image?: string;
  application_deadline?: string;
  max_participants?: number;
  registration_link?: string;
}

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onLoginRequired?: () => void;
  onProfileRequired?: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose, onLoginRequired, onProfileRequired }: EventDetailsModalProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl"
          >
            {/* Banner / Full Poster */}
            {event.banner_image && (
              <div className="relative">
                <img
                  src={event.banner_image}
                  alt={event.title}
                  className="w-full max-h-[50vh] object-contain bg-black"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#111] to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            <div className={`p-6 sm:p-8 ${!event.banner_image ? 'pt-6' : '-mt-8 relative'}`}>
              {/* Close button if no banner */}
              {!event.banner_image && (
                <div className="flex justify-end mb-4">
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'upcoming'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : event.status === 'past'
                    ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {event.status}
                </span>
                {event.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Tag className="w-3 h-3" />
                    {event.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{event.title}</h2>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {event.event_date && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
                {event.event_time && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock className="w-4 h-4" />
                    {event.event_time}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                )}
                {event.max_participants && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Users className="w-4 h-4" />
                    Max {event.max_participants} participants
                  </div>
                )}
              </div>

              {/* Deadline Warning */}
              {event.application_deadline && event.status === 'upcoming' && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-amber-300 text-sm">
                    <strong>Application Deadline:</strong>{' '}
                    {new Date(event.application_deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3">About this Event</h3>
                  <div className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </div>
                </div>
              )}

              {/* Registration Button */}
              {event.status === 'upcoming' && (
                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center">
                  {event.registration_link && (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-indigo-500/25"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply Now
                    </a>
                  )}
                  <EventRegistrationButton
                    eventId={event._id as any}
                    onLoginRequired={onLoginRequired}
                    onProfileRequired={onProfileRequired}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
