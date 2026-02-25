"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, Users, Search, Download, ChevronDown, ChevronUp, Mail, Phone, Building2, GraduationCap } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function EventApplicationsAdmin() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const events = useQuery(api.events.getAll);
  const applications = useQuery(
    api.eventApplications.getByEvent,
    selectedEventId ? { event_id: selectedEventId as Id<"events"> } : "skip"
  );

  const filteredApplications = (applications || []).filter((app: any) => {
    const q = search.toLowerCase();
    return (
      (app.user_profile?.full_name || "").toLowerCase().includes(q) ||
      (app.user_profile?.email || "").toLowerCase().includes(q) ||
      (app.user_profile?.department || "").toLowerCase().includes(q)
    );
  });

  const selectedEvent = (events || []).find((e: any) => e._id === selectedEventId);

  const handleExportCSV = () => {
    if (!filteredApplications.length) return;
    const headers = ["Name", "Email", "Mobile", "Department", "Year", "Applied Date"];
    const rows = filteredApplications.map((app: any) => [
      app.user_profile?.full_name || "",
      app.user_profile?.email || "",
      app.user_profile?.mobile_number || "",
      app.user_profile?.department || "",
      app.user_profile?.year_of_study || "",
      new Date(app._creationTime).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEvent?.title || "event"}_applications.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Event Applications</h2>
        </div>
      </div>

      {/* Event Selector */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <label className="text-white/60 text-sm mb-2 block">Select an event to view applications:</label>
        <select
          value={selectedEventId}
          onChange={(e) => { setSelectedEventId(e.target.value); setSearch(""); }}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="" className="bg-gray-800">-- Select Event --</option>
          {(events || []).map((event: any) => (
            <option key={event._id} value={event._id} className="bg-gray-800">
              {event.title} ({event.status})
            </option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <>
          {/* Search and Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-sm">{filteredApplications.length} applicant(s)</span>
              <button
                onClick={handleExportCSV}
                disabled={!filteredApplications.length}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Applications List */}
          {applications === undefined ? (
            <div className="text-center py-12 text-white/40">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">{search ? "No applicants match your search" : "No applications for this event yet"}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 text-left">
                      <th className="px-4 py-3 text-white/60 text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-white/60 text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-white/60 text-sm font-medium">Mobile</th>
                      <th className="px-4 py-3 text-white/60 text-sm font-medium">Department</th>
                      <th className="px-4 py-3 text-white/60 text-sm font-medium">Year</th>
                      <th className="px-4 py-3 text-white/60 text-sm font-medium">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApplications.map((app: any) => (
                      <tr key={app._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white text-sm">{app.user_profile?.full_name || "—"}</td>
                        <td className="px-4 py-3 text-white/70 text-sm">{app.user_profile?.email || "—"}</td>
                        <td className="px-4 py-3 text-white/70 text-sm">{app.user_profile?.mobile_number || "—"}</td>
                        <td className="px-4 py-3 text-white/70 text-sm">{app.user_profile?.department || "—"}</td>
                        <td className="px-4 py-3 text-white/70 text-sm">{app.user_profile?.year_of_study || "—"}</td>
                        <td className="px-4 py-3 text-white/50 text-sm">{new Date(app._creationTime).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredApplications.map((app: any) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer"
                    onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{app.user_profile?.full_name || "No name"}</p>
                        <p className="text-white/50 text-sm">{app.user_profile?.email || ""}</p>
                      </div>
                      <span className="text-white/30 text-xs">{new Date(app._creationTime).toLocaleDateString()}</span>
                    </div>
                    {expandedApp === app._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-white/60 text-sm"><Phone className="w-4 h-4" />{app.user_profile?.mobile_number || "Not provided"}</div>
                        <div className="flex items-center gap-2 text-white/60 text-sm"><Building2 className="w-4 h-4" />{app.user_profile?.department || "Not provided"}</div>
                        <div className="flex items-center gap-2 text-white/60 text-sm"><GraduationCap className="w-4 h-4" />{app.user_profile?.year_of_study || "Not provided"}</div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
