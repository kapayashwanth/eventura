"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, MapPin, X, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AppliedEvent {
  id: string;
  event_id: string;
  applied_at: string;
  event_title: string;
  event_date: string;
  application_deadline: string;
  event_location?: string;
  event_category: string;
  reminder_sent: boolean;
}

export function AppliedEventsSection() {
  const [appliedEvents, setAppliedEvents] = useState<AppliedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppliedEvents();
  }, []);

  const fetchAppliedEvents = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please login to view applied events");
        setLoading(false);
        return;
      }

      // Get applied events with event details
      const { data, error: fetchError } = await supabase
        .from('event_applications')
        .select(`
          id,
          event_id,
          applied_at,
          is_applied,
          reminder_sent,
          events:event_id (
            title,
            event_date,
            application_deadline,
            location,
            category
          )
        `)
        .eq('user_id', user.id)
        .eq('is_applied', true)
        .order('applied_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data
      const events = (data || []).map((app: any) => ({
        id: app.id,
        event_id: app.event_id,
        applied_at: app.applied_at,
        event_title: app.events?.title || 'Unknown Event',
        event_date: app.events?.event_date,
        application_deadline: app.events?.application_deadline,
        event_location: app.events?.location,
        event_category: app.events?.category,
        reminder_sent: app.reminder_sent
      }));

      setAppliedEvents(events);
    } catch (err: any) {
      console.error("Error fetching applied events:", err);
      setError(err.message || "Failed to load applied events");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplication = async (applicationId: string, eventTitle: string) => {
    if (!confirm(`Remove "${eventTitle}" from applied events?`)) return;

    try {
      const { error } = await supabase
        .from('event_applications')
        .update({ is_applied: false })
        .eq('id', applicationId);

      if (error) throw error;

      // Remove from list
      setAppliedEvents(prev => prev.filter(e => e.id !== applicationId));
    } catch (err: any) {
      console.error("Error removing application:", err);
      alert("Failed to remove application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">My Applied Events</h2>
        <div className="text-white/50 text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">My Applied Events</h2>
        <div className="text-red-400 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-4">My Applied Events</h2>
      
      {appliedEvents.length === 0 ? (
        <div className="text-white/50 text-center py-8">
          <p>You haven't applied to any events yet.</p>
          <p className="text-sm mt-2">Browse events and click "Mark as Applied" to track them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appliedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{event.event_title}</h3>
                      <span className="inline-block px-2 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-300">
                        {event.event_category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {event.event_date && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Event: {new Date(event.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}

                    {event.application_deadline && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Deadline: {new Date(event.application_deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    )}

                    {event.event_location && (
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{event.event_location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-white/40 text-xs mt-2">
                      <span>Applied: {new Date(event.applied_at).toLocaleDateString()}</span>
                      {event.reminder_sent && (
                        <span className="text-green-400">• Reminder sent</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveApplication(event.id, event.event_title)}
                  className="flex-shrink-0 p-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors group"
                  title="Remove from applied events"
                >
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
