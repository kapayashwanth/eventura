"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Users, Bell, Calendar, ChevronDown, ChevronUp, Mail, Phone, Building2, GraduationCap, Shield } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function UserRemindersAdmin() {
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "with-reminders" | "no-reminders">("all");

  const usersWithReminders = useQuery(api.eventApplications.getAllUsersWithReminders);

  const filteredUsers = (usersWithReminders || [])
    .filter((u: any) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.department || "").toLowerCase().includes(q);

      if (filter === "with-reminders") return matchesSearch && u.reminded_events.length > 0;
      if (filter === "no-reminders") return matchesSearch && u.reminded_events.length === 0;
      return matchesSearch;
    });

  const totalReminders = (usersWithReminders || []).reduce((sum: number, u: any) => sum + u.reminded_events.length, 0);
  const usersWithActiveReminders = (usersWithReminders || []).filter((u: any) => u.reminded_events.length > 0).length;

  if (usersWithReminders === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading users and reminders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">{usersWithReminders.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500/20 to-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Users with Reminders</p>
              <p className="text-2xl font-bold text-white mt-1">{usersWithActiveReminders}</p>
            </div>
            <Bell className="w-8 h-8 text-rose-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Reminders</p>
              <p className="text-2xl font-bold text-white mt-1">{totalReminders}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Header + Search + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Users & Their Reminders ({filteredUsers.length})</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Users</option>
            <option value="with-reminders">With Reminders</option>
            <option value="no-reminders">No Reminders</option>
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((user: any) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                  {(user.full_name || "?")[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{user.full_name || "No name"}</p>
                    {user.role === "admin" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Shield className="w-3 h-3" />admin
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  user.reminded_events.length > 0
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}>
                  <Bell className="w-3 h-3" />
                  {user.reminded_events.length} reminder{user.reminded_events.length !== 1 ? "s" : ""}
                </span>
                {expandedUser === user._id ? (
                  <ChevronUp className="w-4 h-4 text-white/40" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                )}
              </div>
            </button>

            {expandedUser === user._id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-5 pb-4 border-t border-white/10"
              >
                {/* User Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {user.mobile_number || "Not provided"}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.department || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <GraduationCap className="w-4 h-4 flex-shrink-0" />
                    {user.year_of_study || "Not provided"}
                  </div>
                </div>

                {/* Reminded Events */}
                {user.reminded_events.length > 0 ? (
                  <div className="mt-2">
                    <p className="text-white/70 text-sm font-medium mb-2">Reminded Events:</p>
                    <div className="space-y-2">
                      {user.reminded_events.map((event: any) => (
                        <div
                          key={event._id}
                          className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <div>
                              <p className="text-white text-sm font-medium">{event.title}</p>
                              <p className="text-white/40 text-xs">
                                {event.event_date ? new Date(event.event_date).toLocaleDateString() : "No date"}
                                {event.applied_at && ` • Reminded on ${new Date(event.applied_at).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.status === "upcoming"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-center py-4">
                    <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">No reminders set</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No users found</p>
        </div>
      )}
    </div>
  );
}
