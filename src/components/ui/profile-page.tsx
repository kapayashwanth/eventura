"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, Edit2, Save, X, Camera, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface UserProfile {
  id: string;
  full_name: string;
  mobile_number: string | null;
  department: string | null;
  year_of_study: string | null;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
}

interface ProfilePageProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onAboutClick?: () => void;
  onPastEventsClick?: () => void;
  onUpcomingEventsClick?: () => void;
  onContactClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRegisteredEventsClick?: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userName?: string;
  onProfileUpdate?: () => void;
}

export function ProfilePage({
  onLoginClick,
  onSignupClick,
  onAboutClick,
  onPastEventsClick,
  onUpcomingEventsClick,
  onContactClick,
  onHomeClick,
  onProfileClick,
  onRegisteredEventsClick,
  isAuthenticated,
  onLogout,
  userName,
  onProfileUpdate
}: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Edit form state
  const [editedName, setEditedName] = useState("");
  const [editedMobile, setEditedMobile] = useState("");
  const [editedDepartment, setEditedDepartment] = useState("");
  const [editedYear, setEditedYear] = useState("");
  const [editedBio, setEditedBio] = useState("");

  const departments = [
    { value: "", label: "Select Department" },
    { value: "Computer Science and Engineering", label: "Computer Science and Engineering" },
    { value: "Artificial Intelligence and Data Science", label: "Artificial Intelligence and Data Science" },
    { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering" }
  ];

  const years = [
    { value: "", label: "Select Year" },
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user with all details
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        window.location.href = '/';
        return;
      }

      setEmail(user.email || "");

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // If profile doesn't exist, create one from user metadata
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                mobile_number: user.user_metadata?.mobile_number || null,
                department: user.user_metadata?.department || null,
                year_of_study: user.user_metadata?.year_of_study || null,
              }
            ])
            .select()
            .single();

          if (!createError && newProfile) {
            setProfile(newProfile);
            setEditedName(newProfile.full_name || "");
            setEditedMobile(newProfile.mobile_number || "");
            setEditedDepartment(newProfile.department || "");
            setEditedYear(newProfile.year_of_study || "");
            setEditedBio(newProfile.bio || "");
          }
        } else {
          throw profileError;
        }
      } else if (profileData) {
        setProfile(profileData);
        setEditedName(profileData.full_name || "");
        setEditedMobile(profileData.mobile_number || "");
        setEditedDepartment(profileData.department || "");
        setEditedYear(profileData.year_of_study || "");
        setEditedBio(profileData.bio || "");
        
        // Check if profile is incomplete (Google login users)
        if (!profileData.mobile_number || !profileData.department || !profileData.year_of_study) {
          setEditing(true); // Auto-enable edit mode
          setError("⚠️ PROFILE INCOMPLETE: You must complete all required fields (Mobile Number, Department, Year of Study) before you can use the app.");
        }
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      // Only show user-friendly errors, not technical database errors
      if (err.message && !err.message.includes('RPC') && !err.message.includes('permission')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      // Validation
      if (!editedName) {
        setError("Name is required");
        setSaving(false);
        return;
      }

      if (!editedMobile) {
        setError("Mobile number is required");
        setSaving(false);
        return;
      }

      if (!/^\d{10}$/.test(editedMobile)) {
        setError("Please enter a valid 10-digit mobile number");
        setSaving(false);
        return;
      }

      if (!editedDepartment) {
        setError("Please select a department");
        setSaving(false);
        return;
      }

      if (!editedYear) {
        setError("Please select your year of study");
        setSaving(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        setSaving(false);
        return;
      }

      console.log("Updating profile for user:", user.id);
      console.log("Update data:", {
        full_name: editedName,
        mobile_number: editedMobile,
        department: editedDepartment,
        year_of_study: editedYear,
        bio: editedBio
      });

      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: editedName,
          mobile_number: editedMobile || null,
          department: editedDepartment || null,
          year_of_study: editedYear || null,
          bio: editedBio || null,
        })
        .eq('id', user.id)
        .select();

      console.log("Update result:", { data: updateData, error: updateError });

      if (updateError) {
        console.error("Update error details:", updateError);
        throw new Error(`Database update failed: ${updateError.message}. Please run FIX_PROFILE_UPDATE.sql in Supabase.`);
      }

      if (!updateData || updateData.length === 0) {
        throw new Error("Profile not found or update failed. Please ensure your profile exists in the database.");
      }

      // Immediately update local state with new values
      if (profile) {
        setProfile({
          ...profile,
          full_name: editedName,
          mobile_number: editedMobile || null,
          department: editedDepartment || null,
          year_of_study: editedYear || null,
          bio: editedBio || null,
        });
      }

      // Clear any previous error messages
      setError("");
      setMessage("Profile updated successfully!");
      setEditing(false);
      
      // Refresh profile data from database to ensure sync
      await fetchProfile();
      
      // Notify parent component that profile was updated
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedName(profile?.full_name || "");
    setEditedMobile(profile?.mobile_number || "");
    setEditedDepartment(profile?.department || "");
    setEditedYear(profile?.year_of_study || "");
    setEditedBio(profile?.bio || "");
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar 
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onAboutClick={onAboutClick}
        onPastEventsClick={onPastEventsClick}
        onUpcomingEventsClick={onUpcomingEventsClick}
        onContactClick={onContactClick}
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onRegisteredEventsClick={onRegisteredEventsClick}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        userName={userName}
      />
      
      <div className="flex-grow py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              My Profile
            </h1>
            <p className="text-white/60 text-sm sm:text-base">
              Manage your account information
            </p>
          </motion.div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 text-sm rounded-xl p-6 ${
                error.includes('INCOMPLETE') 
                  ? 'text-red-300 bg-red-600/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20' 
                  : 'text-red-400 bg-red-500/10 border border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {error.includes('INCOMPLETE') && (
                  <div className="text-2xl">🚫</div>
                )}
                <div className="flex-1">
                  <div className={error.includes('INCOMPLETE') ? 'font-semibold text-base' : ''}>
                    {error}
                  </div>
                  {error.includes('INCOMPLETE') && (
                    <div className="mt-3 text-red-200/80 text-sm">
                      Fill in all required fields below and click "Save" to continue using the app.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl p-4"
            >
              {message}
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Profile Header */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 flex items-center justify-center">
              <div className="absolute -bottom-12 sm:-bottom-16">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 p-1">
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                      {profile?.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 sm:w-16 sm:h-16 text-white/60" />
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center justify-center border-2 border-[#0a0a0a]">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-16 sm:pt-20 px-6 sm:px-8 pb-8">
              {/* Edit Button */}
              <div className="flex justify-end mb-6">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-300/30 rounded-xl transition-all text-white text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-300/30 rounded-xl transition-all text-white text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 rounded-xl transition-all text-white text-sm disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-white text-lg">{profile?.full_name || "Not provided"}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-white text-lg">{email}</p>
                  <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editedMobile}
                      onChange={(e) => setEditedMobile(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Enter 10-digit mobile number"
                    />
                  ) : (
                    <p className="text-white text-lg">{profile?.mobile_number || "Not provided"}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Building2 className="w-4 h-4" />
                    Department
                  </label>
                  {editing ? (
                    <select
                      value={editedDepartment}
                      onChange={(e) => setEditedDepartment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value} className="bg-gray-800 text-white">
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white text-lg">{profile?.department || "Not provided"}</p>
                  )}
                </div>

                {/* Year of Study */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Year of Study
                  </label>
                  {editing ? (
                    <select
                      value={editedYear}
                      onChange={(e) => setEditedYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {years.map((year) => (
                        <option key={year.value} value={year.value} className="bg-gray-800 text-white">
                          {year.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white text-lg">{profile?.year_of_study || "Not provided"}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Edit2 className="w-4 h-4" />
                    Bio
                  </label>
                  {editing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-white text-lg">{profile?.bio || "No bio added yet"}</p>
                  )}
                </div>

                {/* Account Info */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-white/40 text-sm">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
