"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, User, Users, ExternalLink } from "lucide-react";
import { ButtonColorful } from "./button-colorful";

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

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Event Image */}
            {event.banner_image && (
              <div className="relative w-full bg-black/40">
                <img
                  src={event.banner_image}
                  alt={event.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-indigo-500/80 backdrop-blur-md rounded-full text-sm font-medium text-white border border-white/20">
                    {event.category}
                  </span>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="p-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-rose-300">
                {event.title}
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {event.event_date && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Date & Time</p>
                      <p className="text-white font-medium">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-white/70 text-sm">
                        {new Date(event.event_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                      <MapPin className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Location</p>
                      <p className="text-white font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.organizer && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <User className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Organized By</p>
                      <p className="text-white font-medium">{event.organizer}</p>
                    </div>
                  </div>
                )}

                {event.max_participants && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Max Participants</p>
                      <p className="text-white font-medium">{event.max_participants} people</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">About This Event</h3>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Register Button */}
              {event.registration_link && (
                <div className="flex gap-4">
                  <ButtonColorful
                    label="Register Now"
                    onClick={() => window.open(event.registration_link, '_blank')}
                    className="flex-1"
                  />
                  <button
                    onClick={() => window.open(event.registration_link, '_blank')}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open Link
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
