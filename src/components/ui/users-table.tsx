"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Users, Shield, Mail, Phone, Building2, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("full_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const users = useQuery(api.userProfiles.getAll);

  const filteredUsers = (users || [])
    .filter((u: any) => {
      const q = search.toLowerCase();
      return (
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.department || "").toLowerCase().includes(q) ||
        (u.mobile_number || "").toLowerCase().includes(q)
      );
    })
    .sort((a: any, b: any) => {
      const aVal = ((a as any)[sortField] || "").toString().toLowerCase();
      const bVal = ((b as any)[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Registered Users ({filteredUsers.length})</h2>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 text-left">
              <th onClick={() => handleSort("full_name")} className="cursor-pointer px-4 py-3 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1">Name <SortIcon field="full_name" /></div>
              </th>
              <th onClick={() => handleSort("email")} className="cursor-pointer px-4 py-3 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1">Email <SortIcon field="email" /></div>
              </th>
              <th onClick={() => handleSort("mobile_number")} className="cursor-pointer px-4 py-3 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1">Mobile <SortIcon field="mobile_number" /></div>
              </th>
              <th onClick={() => handleSort("department")} className="cursor-pointer px-4 py-3 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1">Department <SortIcon field="department" /></div>
              </th>
              <th onClick={() => handleSort("year_of_study")} className="cursor-pointer px-4 py-3 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1">Year <SortIcon field="year_of_study" /></div>
              </th>
              <th onClick={() => handleSort("role")} className="cursor-pointer px-4 py-3 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1">Role <SortIcon field="role" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user: any) => (
              <tr key={user._id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white text-sm">{user.full_name || "—"}</td>
                <td className="px-4 py-3 text-white/70 text-sm">{user.email}</td>
                <td className="px-4 py-3 text-white/70 text-sm">{user.mobile_number || "—"}</td>
                <td className="px-4 py-3 text-white/70 text-sm">{user.department || "—"}</td>
                <td className="px-4 py-3 text-white/70 text-sm">{user.year_of_study || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                    {user.role === 'admin' && <Shield className="w-3 h-3" />}
                    {user.role || "user"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user: any) => (
          <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-4" onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{user.full_name || "No name"}</p>
                <p className="text-white/50 text-sm">{user.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                {user.role || "user"}
              </span>
            </div>
            {expandedUser === user._id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white/60 text-sm"><Phone className="w-4 h-4" />{user.mobile_number || "Not provided"}</div>
                <div className="flex items-center gap-2 text-white/60 text-sm"><Building2 className="w-4 h-4" />{user.department || "Not provided"}</div>
                <div className="flex items-center gap-2 text-white/60 text-sm"><GraduationCap className="w-4 h-4" />{user.year_of_study || "Not provided"}</div>
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
