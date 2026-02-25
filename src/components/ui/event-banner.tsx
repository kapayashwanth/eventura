"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  status?: string;
  banner_image?: string;
}

interface EventBannerProps {
  event: Event;
  onClick?: () => void;
}

export function EventBanner({ event, onClick }: EventBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      {event.banner_image ? (
        <div className="relative h-64 sm:h-80 md:h-96">
          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                event.status === 'upcoming'
                  ? 'bg-green-500/30 text-green-200 border border-green-500/30'
                  : 'bg-gray-500/30 text-gray-200 border border-gray-500/30'
              }`}>
                {event.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">
              {event.title}
            </h2>
            {event.description && (
              <p className="text-white/70 text-sm sm:text-base mb-4 line-clamp-2 max-w-2xl">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              {event.event_date && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 sm:h-80 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{event.title}</h2>
            {event.description && (
              <p className="text-white/60 text-sm max-w-lg mx-auto">{event.description}</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
