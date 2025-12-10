"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BackgroundPaperDemo from "./background-paper-demo";

interface SignupProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
  onSignupSuccess?: () => void;
}

export function Signup({ onSwitchToLogin, onClose, onSignupSuccess }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fullName || !email || !password || !mobileNumber || !department || !yearOfStudy) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              mobile_number: mobileNumber,
              department: department,
              year_of_study: yearOfStudy,
              role: 'user',
            }
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          setError(`Account created but profile setup incomplete: ${profileError.message}. Please update your profile after logging in.`);
        } else {
          setMessage("Account created! Please check your email to verify your account.");
          console.log("Signup successful with profile, user:", data.user.email);
        }
        
        // Redirect after showing message, even if profile creation failed
        setTimeout(() => {
          if (onSignupSuccess) {
            onSignupSuccess();
          }
        }, profileError ? 3000 : 2000);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError(err.message || "Failed to sign up with Google.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full">
      {/* Background */}
      <BackgroundPaperDemo />

      {/* Centered glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 shadow-lg"
        >
          <UserPlus className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-white mb-6 text-center"
        >
          Create Account
        </motion.h2>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 text-left bg-red-500/10 border border-red-500/30 rounded-xl p-3"
              >
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-400 text-left bg-green-500/10 border border-green-500/30 rounded-xl p-3"
              >
                {message}
              </motion.div>
            )}

            {/* Full Name Input */}
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              placeholder="Full Name"
              type="text"
              value={fullName}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />

            {/* Email Input */}
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            {/* Mobile Number Input */}
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              placeholder="Mobile Number (10 digits)"
              type="tel"
              value={mobileNumber}
              maxLength={10}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />

            {/* Department Selection */}
            <motion.select
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.58 }}
              value={department}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value} className="bg-gray-800 text-white">
                  {dept.label}
                </option>
              ))}
            </motion.select>

            {/* Year of Study Selection */}
            <motion.select
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.59 }}
              value={yearOfStudy}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setYearOfStudy(e.target.value)}
              disabled={loading}
            >
              {years.map((year) => (
                <option key={year.value} value={year.value} className="bg-gray-800 text-white">
                  {year.label}
                </option>
              ))}
            </motion.select>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-start gap-2"
            >
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 accent-gray-400 cursor-pointer"
              />
              <label className="text-xs text-gray-400 cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                I agree to the{" "}
                <a href="#" className="underline text-white/80 hover:text-white" onClick={(e) => e.stopPropagation()}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline text-white/80 hover:text-white" onClick={(e) => e.stopPropagation()}>
                  Privacy Policy
                </a>
              </label>
            </motion.div>
          </div>

          <hr className="opacity-10" />

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#232526] to-[#2d2e30] rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition mb-2 text-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Sign In Link */}
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="underline text-white/80 hover:text-white"
                >
                  Sign in
                </button>
              </span>
            </div>
          </motion.div>
        </form>
      </motion.div>

      {/* User count and avatars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 mt-12 flex flex-col items-center text-center"
      >
        <p className="text-gray-400 text-sm mb-2">
          Join <span className="font-medium text-white">thousands</span> of users
          who are already using our platform.
        </p>
        <div className="flex -space-x-2">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}
