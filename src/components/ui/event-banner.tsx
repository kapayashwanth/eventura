"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, ExternalLink, Eye, X } from "lucide-react";
import { Event } from "@/lib/supabase";
import { ButtonColorful } from "./button-colorful";
import { EventDetailsModal } from "./event-details-modal";

interface EventBannerProps {
  events: Event[];
}

export function EventBanner({ events }: EventBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (events.length === 0) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [events.length]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  if (events.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-indigo-500/10 to-rose-500/10 rounded-3xl flex items-center justify-center">
        <p className="text-white/50 text-lg">No events available</p>
      </div>
    );
  }

  const currentEvent = events[currentIndex];
  const eventDate = new Date(currentEvent.event_date);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl md:rounded-3xl group">
      {/* Banner Container */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]"
        >
          <div className="flex h-full">
            {/* Left Side - Poster Image */}
            <div className="w-full md:w-1/2 lg:w-2/5 relative flex items-center justify-center bg-black p-4 md:p-8">
              {currentEvent.banner_image ? (
                <img
                  src={currentEvent.banner_image}
                  alt={currentEvent.title}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-white/50 text-lg">No Image</span>
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 items-center relative">
              {/* Gradient Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]/90" />
              
              <div className="relative z-10 px-8 lg:px-12 py-8">
                {/* Category Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium uppercase tracking-wider backdrop-blur-sm">
                    {currentEvent.category}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 text-white leading-tight"
                >
                  {currentEvent.title}
                </motion.h2>

                {/* Meta Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-4 lg:gap-6 mb-6 text-white/80"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm lg:text-base">
                      {eventDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {currentEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm lg:text-base">{currentEvent.location}</span>
                    </div>
                  )}
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/70 text-sm lg:text-base mb-6 line-clamp-3 lg:line-clamp-4"
                >
                  {currentEvent.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4"
                >
                  <motion.button
                    onClick={() => handleViewDetails(currentEvent)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-indigo-500/80 to-rose-500/80 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-sm lg:text-base hover:from-indigo-500 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </motion.button>
                  {currentEvent.registration_link && currentEvent.status === 'upcoming' && (
                    <ButtonColorful
                      label="Register Now"
                      onClick={() => window.open(currentEvent.registration_link, '_blank')}
                      className="px-6 lg:px-8"
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Mobile - Content Below (shown on small screens) */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent p-6">
              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-3"
              >
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium uppercase tracking-wider">
                  {currentEvent.category}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2 text-white leading-tight"
              >
                {currentEvent.title}
              </motion.h2>

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 mb-3 text-white/80 text-xs"
              >
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {eventDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {currentEvent.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{currentEvent.location}</span>
                  </div>
                )}
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-2"
              >
                <button
                  onClick={() => handleViewDetails(currentEvent)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/80 to-rose-500/80 rounded-full text-white font-semibold text-xs"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                {currentEvent.registration_link && currentEvent.status === 'upcoming' && (
                  <button
                    onClick={() => window.open(currentEvent.registration_link, '_blank')}
                    className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-xs"
                  >
                    Register
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 h-2 bg-white rounded-full'
                : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
