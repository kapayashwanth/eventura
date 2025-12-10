"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  LogOut, 
  Plus, 
  Calendar, 
  LayoutDashboard,
  Settings,
  User,
  Users
} from "lucide-react";
import { supabase, Event } from "@/lib/supabase";
import { EventForm } from "./event-form";
import { EventsTable } from "./events-table";
import { UsersTable } from "./users-table";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "create" | "users">("overview");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchEvents();
  }, []);

  const fetchUserData = async () => {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "Admin");
    }
  };

  const fetchEvents = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleEventCreated = () => {
    fetchEvents();
    setActiveTab("events");
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setActiveTab("create");
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!supabase) return;
    
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === "upcoming").length,
    past: events.filter(e => e.status === "past").length,
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-white/50">Amrita Vishwa Vidyapeetham Nagercoil Campus</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <User className="w-4 h-4" />
                <span className="text-sm hidden md:inline">{userEmail}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "events", label: "All Events", icon: Calendar },
              { id: "users", label: "Registered Users", icon: Users },
              { id: "create", label: "Create Event", icon: Plus },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id !== "create") setEditingEvent(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-white/50 hover:text-indigo-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-indigo-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Upcoming Events</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.upcoming}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-500/20 to-rose-500/10 border border-rose-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Past Events</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.past}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-rose-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("create")}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 hover:from-indigo-500/30 hover:to-rose-500/30 border border-indigo-500/30 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5 text-indigo-400" />
                  <span className="text-white font-medium">Create New Event</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("events")}
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-300/30 rounded-lg transition-all"
                >
                  <Calendar className="w-5 h-5 text-white/70" />
                  <span className="text-white font-medium">View All Events</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EventsTable 
              events={events} 
              loading={loading}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onRefresh={fetchEvents}
            />
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UsersTable />
          </motion.div>
        )}

        {activeTab === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EventForm 
              event={editingEvent}
              onSuccess={handleEventCreated}
              onCancel={() => {
                setEditingEvent(null);
                setActiveTab("events");
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
