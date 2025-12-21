"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, Users, Mail, Phone, Download, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EventWithApplications {
  id: string;
  title: string;
  event_date: string;
  application_deadline: string;
  category: string;
  location: string;
  applications_count: number;
}

interface ApplicationDetails {
  user_name: string;
  user_email: string;
  user_mobile: string;
  user_department: string;
  user_year: string;
  applied_at: string;
  reminder_sent: boolean;
}

export function EventApplicationsAdmin() {
  const [events, setEvents] = useState<EventWithApplications[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEventsWithApplications();
  }, []);

  const fetchEventsWithApplications = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get all events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (eventsError) throw eventsError;

      // Get application counts for each event
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('event_applications')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('is_applied', true);

          return {
            id: event.id,
            title: event.title,
            event_date: event.event_date,
            application_deadline: event.application_deadline,
            category: event.category,
            location: event.location,
            applications_count: count || 0
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsForEvent = async (eventId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          applied_at,
          reminder_sent,
          user_profiles:user_id (
            full_name,
            email,
            mobile_number,
            department,
            year_of_study
          )
        `)
        .eq('event_id', eventId)
        .eq('is_applied', true)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      const applicationsData = (data || []).map((app: any) => ({
        user_name: app.user_profiles?.full_name || 'Unknown',
        user_email: app.user_profiles?.email || 'N/A',
        user_mobile: app.user_profiles?.mobile_number || 'N/A',
        user_department: app.user_profiles?.department || 'N/A',
        user_year: app.user_profiles?.year_of_study || 'N/A',
        applied_at: app.applied_at,
        reminder_sent: app.reminder_sent
      }));

      setApplications(applicationsData);
      setSelectedEvent(eventId);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      alert("Failed to load applications");
    }
  };

  const exportToCSV = (eventTitle: string) => {
    if (applications.length === 0) return;

    const headers = ['Name', 'Email', 'Mobile', 'Department', 'Year', 'Applied Date', 'Reminder Sent'];
    const csvData = applications.map(app => [
      app.user_name,
      app.user_email,
      app.user_mobile,
      app.user_department,
      app.user_year,
      new Date(app.applied_at).toLocaleDateString(),
      app.reminder_sent ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Event Applications</h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Events List */}
      <div className="grid gap-4">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-300">
                        {event.category}
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-300 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.applications_count} Applications
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Event: {new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  {event.application_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(event.application_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => fetchApplicationsForEvent(event.id)}
                className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/30 transition-colors flex items-center gap-2 text-white text-sm"
              >
                <Eye className="w-4 h-4" />
                View Applications
              </button>
            </div>

            {/* Applications List */}
            {selectedEvent === event.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    Applications ({applications.length})
                  </h4>
                  {applications.length > 0 && (
                    <button
                      onClick={() => exportToCSV(event.title)}
                      className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 text-green-400 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  )}
                </div>

                {applications.length === 0 ? (
                  <p className="text-white/50 text-center py-4">No applications yet</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-white font-semibold mb-1">{app.user_name}</p>
                            <div className="space-y-1 text-white/60">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{app.user_email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                <span>{app.user_mobile}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-white/60 space-y-1">
                            <p>Department: {app.user_department}</p>
                            <p>Year: {app.user_year}</p>
                            <p className="text-xs">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                            {app.reminder_sent && (
                              <p className="text-xs text-green-400">✓ Reminder sent</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
