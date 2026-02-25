"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AppliedEventsSection() {
  const { user } = useAuth();

  const applications = useQuery(
    api.eventApplications.getByUser,
    user ? { user_id: user.uid } : "skip"
  );
  const removeApplication = useMutation(api.eventApplications.remove);

  const handleRemove = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await removeApplication({ id: applicationId as any });
    } catch (err: any) {
      console.error("Error removing application:", err);
    }
  };

  if (applications === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading applications...</div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/40 text-lg">No applications yet</p>
        <p className="text-white/30 text-sm mt-2">Apply to events to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-400" />
        My Applications ({applications.length})
      </h3>
      <div className="grid gap-4">
        {applications.map((app: any) => (
          <motion.div
            key={app._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium text-lg">{app.events?.title || "Event"}</h4>
                <div className="flex flex-wrap gap-4 mt-2">
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
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    app.events?.status === 'upcoming'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {app.events?.status || "unknown"}
                  </span>
                  <span className="text-white/30 text-xs ml-3">
                    Applied on {new Date(app._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(app._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Withdraw
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
