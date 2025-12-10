"use client";

import { motion } from "framer-motion";
import { Edit, Trash2, Calendar, MapPin, Users, ExternalLink, RefreshCw } from "lucide-react";
import { Event } from "@/lib/supabase";

interface EventsTableProps {
  events: Event[];
  loading: boolean;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onRefresh: () => void;
}

export function EventsTable({ events, loading, onEdit, onDelete, onRefresh }: EventsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hackathon: "from-rose-500/20 to-rose-500/10 border-rose-500/30 text-rose-400",
      workshop: "from-blue-500/20 to-blue-500/10 border-blue-500/30 text-blue-400",
      "tech-talk": "from-green-500/20 to-green-500/10 border-green-500/30 text-green-400",
      seminar: "from-yellow-500/20 to-yellow-500/10 border-yellow-500/30 text-yellow-400",
      conference: "from-red-500/20 to-red-500/10 border-red-500/30 text-red-400",
      competition: "from-orange-500/20 to-orange-500/10 border-orange-500/30 text-orange-400",
      webinar: "from-cyan-500/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400",
      general: "from-white/20 to-white/10 border-white/30 text-white/70",
    };
    return colors[category] || colors.general;
  };

  const getStatusColor = (status: string) => {
    return status === "upcoming" 
      ? "bg-green-500/20 border-green-500/30 text-green-400"
      : "bg-gray-500/20 border-gray-500/30 text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/50">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">All Events ({events.length})</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-300/30 rounded-lg text-white/70 hover:text-indigo-300 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </motion.button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/50">No events found. Create your first event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-indigo-300/20 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Image */}
                {event.banner_image && (
                  <div className="lg:w-48 h-32 flex-shrink-0">
                    <img
                      src={event.banner_image}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Event Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-white/60 text-sm line-clamp-2">{event.description}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.max_participants && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Users className="w-4 h-4" />
                        <span>Max: {event.max_participants}</span>
                      </div>
                    )}

                    {event.organizer && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Users className="w-4 h-4" />
                        <span>{event.organizer}</span>
                      </div>
                    )}

                    {event.registration_link && (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-400 hover:text-rose-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Registration Link</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-24">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(event)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-300/30 border border-indigo-500/30 hover:border-indigo-300 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="lg:hidden">Edit</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(event.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-rose-300/30 border border-red-500/30 hover:border-rose-300 text-red-400 hover:text-rose-300 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="lg:hidden">Delete</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
