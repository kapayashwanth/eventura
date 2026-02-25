"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Trash2, Bell, BellRing } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface RegisteredEventsPageProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onAboutClick?: () => void;
  onPastEventsClick?: () => void;
  onUpcomingEventsClick?: () => void;
  onContactClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRegisteredEventsClick?: () => void;
  onAdminClick?: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export function RegisteredEventsPage(props: RegisteredEventsPageProps) {
  const { user } = useAuth();

  const applications = useQuery(
    api.eventApplications.getByUser,
    user ? { user_id: user.uid } : "skip"
  );
  const toggleApplication = useMutation(api.eventApplications.toggle);

  const handleWithdraw = async (eventId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await toggleApplication({
        user_id: user.uid,
        event_id: eventId as any,
      });
    } catch (err: any) {
      console.error("Error withdrawing application:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar
        onLoginClick={props.onLoginClick}
        onSignupClick={props.onSignupClick}
        onAboutClick={props.onAboutClick}
        onPastEventsClick={props.onPastEventsClick}
        onUpcomingEventsClick={props.onUpcomingEventsClick}
        onContactClick={props.onContactClick}
        onHomeClick={props.onHomeClick}
        onProfileClick={props.onProfileClick}
        onRegisteredEventsClick={props.onRegisteredEventsClick}
        onAdminClick={props.onAdminClick}
        isAuthenticated={props.isAuthenticated}
        isAdmin={props.isAdmin}
        onLogout={props.onLogout}
        userName={props.userName}
      />

      <div className="flex-grow py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              My Registered Events
            </h1>
            <p className="text-white/60 text-sm sm:text-base">
              Events you have applied to and your active reminders
            </p>
          </motion.div>

          {applications === undefined ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-white/60 text-lg">Loading...</div>
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-6" />
              <p className="text-white/40 text-xl">No registered events yet</p>
              <p className="text-white/30 text-sm mt-2">
                Browse upcoming events and apply to get started
              </p>
              <button
                onClick={props.onUpcomingEventsClick}
                className="mt-6 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {applications.map((app: any, index: number) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    {app.events?.banner_image && (
                      <div className="md:w-48 h-32 md:h-auto">
                        <img
                          src={app.events.banner_image}
                          alt={app.events.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">
                            {app.events?.title || "Event"}
                          </h3>
                          {app.events?.description && (
                            <p className="text-white/50 text-sm mt-1 line-clamp-2">
                              {app.events.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-3">
                            {app.events?.event_date && (
                              <div className="flex items-center gap-1 text-white/50 text-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(app.events.event_date).toLocaleDateString()}
                              </div>
                            )}
                            {app.events?.event_time && (
                              <div className="flex items-center gap-1 text-white/50 text-sm">
                                <Clock className="w-4 h-4" />
                                {app.events.event_time}
                              </div>
                            )}
                            {app.events?.location && (
                              <div className="flex items-center gap-1 text-white/50 text-sm">
                                <MapPin className="w-4 h-4" />
                                {app.events.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              app.events?.status === "upcoming"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            }`}
                          >
                            {app.events?.status || "unknown"}
                          </span>
                          {app.reminder_sent ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <BellRing className="w-3 h-3" />
                              Reminded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              <Bell className="w-3 h-3" />
                              Reminder Set
                            </span>
                          )}
                          <button
                            onClick={() => app.event_id && handleWithdraw(app.event_id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Withdraw
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 text-white/30 text-xs">
                        Applied on{" "}
                        {new Date(app._creationTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
