"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Mail, Phone, Building2, Calendar, Shield, Search, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  full_name: string;
  mobile_number: string | null;
  department: string | null;
  year_of_study: string | null;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
  email?: string;
  last_sign_in?: string;
  email_confirmed?: boolean;
}

export function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        window.location.href = '/';
        return;
      }

      // Check admin role
      const userRole = user.user_metadata?.role || '';
      if (userRole !== 'admin') {
        setError("Access denied. Admin privileges required.");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Call the database function to get all user profiles with emails
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_user_profiles');

      if (usersError) {
        console.error("Error fetching users:", usersError);
        
        // Check if it's a permission error
        if (usersError.message?.includes('permission denied') || 
            usersError.message?.includes('does not exist')) {
          setError(
            'Database function not found. Please run the SQL migration:\n' +
            '1. Open Supabase Dashboard → SQL Editor\n' +
            '2. Run the code from: QUICK_FIX_USERS_PERMISSION.sql\n' +
            '3. Refresh this page'
          );
          setLoading(false);
          return;
        }
        
        // Fallback to basic profile fetch if function doesn't exist yet
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;
        setUsers(profilesData || []);
        setError('Warning: Email addresses not available. Run SQL migration to fix.');
      } else {
        setUsers(usersData || []);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Mobile', 'Department', 'Year', 'Joined Date'];
    const csvData = users.map(user => [
      user.full_name,
      user.email || 'N/A',
      user.mobile_number || 'N/A',
      user.department || 'N/A',
      user.year_of_study || 'N/A',
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number?.includes(searchTerm) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl text-white mb-2">Access Denied</h1>
          <p className="text-white/60">{error || "Admin privileges required"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Registered Users
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              Total Users: {users.length}
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-300/30 rounded-xl transition-all text-white text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, mobile, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-2">Database Configuration Required</h3>
              <div className="text-yellow-300/80 whitespace-pre-line">
                {error}
              </div>
              {error.includes('SQL migration') && (
                <div className="mt-4 p-4 bg-black/30 rounded-lg border border-yellow-500/20">
                  <p className="text-xs text-yellow-300/60 mb-2">Quick Fix Steps:</p>
                  <ol className="text-xs text-yellow-300/80 space-y-1 list-decimal list-inside">
                    <li>Open file: <code className="bg-yellow-500/10 px-1 rounded">QUICK_FIX_USERS_PERMISSION.sql</code></li>
                    <li>Copy all the SQL code</li>
                    <li>Go to Supabase Dashboard → SQL Editor</li>
                    <li>Paste and click "Run"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 p-[2px]">
                              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                                {user.profile_image ? (
                                  <img
                                    src={user.profile_image}
                                    alt={user.full_name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-5 h-5 text-white/60" />
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {user.full_name}
                              </div>
                              {user.bio && (
                                <div className="text-xs text-white/40 truncate max-w-xs">
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Mail className="w-4 h-4 text-white/40" />
                            {user.email || 'Not available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Phone className="w-4 h-4 text-white/40" />
                            {user.mobile_number || 'Not provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Building2 className="w-4 h-4 text-white/40" />
                            <span className="truncate max-w-xs" title={user.department || ''}>
                              {user.department || 'Not selected'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Shield className="w-4 h-4 text-white/40" />
                            {user.year_of_study || 'Not selected'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Calendar className="w-4 h-4 text-white/40" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-300/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-indigo-300" />
            <span className="text-sm text-white/60">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-300/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-rose-300" />
            <span className="text-sm text-white/60">CSE Students</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {users.filter(u => u.department?.includes('Computer Science')).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-300/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-purple-300" />
            <span className="text-sm text-white/60">AID Students</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {users.filter(u => u.department?.includes('Artificial Intelligence')).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-300/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-green-300" />
            <span className="text-sm text-white/60">ECE Students</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {users.filter(u => u.department?.includes('Electronics')).length}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
