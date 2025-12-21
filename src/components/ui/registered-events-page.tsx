"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RegisteredEvent {
  id: string;
  event_id: string;
  applied_at: string;
  reminder_sent: boolean;
  events: {
    title: string;
    description: string;
    event_date: string;
    application_deadline: string;
    location: string;
    category: string;
    banner_image: string;
  };
}

interface RegisteredEventsPageProps {
  onClose: () => void;
}

export function RegisteredEventsPage({ onClose }: RegisteredEventsPageProps) {
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRegisteredEvents();
  }, []);

  const fetchRegisteredEvents = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from('event_applications')
        .select(`
          id,
          event_id,
          applied_at,
          reminder_sent,
          events (
            title,
            description,
            event_date,
            application_deadline,
            location,
            category,
            banner_image
          )
        `)
        .eq('user_id', user.id)
        .eq('is_applied', true)
        .order('applied_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRegisteredEvents(data || []);
    } catch (err: any) {
      console.error("Error fetching registered events:", err);
      setError(err.message || "Failed to load registered events");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplication = async (eventId: string) => {
    if (!supabase) return;

    if (!confirm("Are you sure you want to remove your application?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: toggleError } = await supabase.rpc('toggle_event_application', {
        p_event_id: eventId
      });

      if (toggleError) throw toggleError;

      // Refresh the list
      fetchRegisteredEvents();
    } catch (err: any) {
      console.error("Error removing application:", err);
      alert(err.message || "Failed to remove application");
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            My Registered Events
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white/60 mt-4">Loading your registered events...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : registeredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center"
          >
            <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Registered Events</h3>
            <p className="text-white/60">You haven't registered for any events yet.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {registeredEvents.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <div className="md:flex">
                  {/* Event Image */}
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img 
                      src={item.events.banner_image || "/placeholder-event.jpg"} 
                      alt={item.events.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-300 mb-2 inline-block">
                          {item.events.category}
                        </span>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.events.title}</h3>
                        <p className="text-white/60 text-sm line-clamp-2">{item.events.description}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Event: {new Date(item.events.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Deadline: {new Date(item.events.application_deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{item.events.location}</span>
                      </div>
                      <div className="text-white/60 text-sm">
                        Applied: {new Date(item.applied_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-300">
                        ✓ Registered
                      </span>
                      {item.reminder_sent && (
                        <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
                          ✓ Reminder Sent
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveApplication(item.event_id)}
                        className="ml-auto px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-red-400 text-sm"
                      >
                        Remove Application
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
