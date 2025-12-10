"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Home, LogOut } from "lucide-react";

interface AccessDeniedProps {
  onGoHome: () => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export function AccessDenied({ onGoHome, onLogout, isAuthenticated }: AccessDeniedProps) {
  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
        
        {/* Card */}
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl" />
              <div className="relative bg-rose-500/10 p-6 rounded-full border border-rose-500/20">
                <ShieldAlert className="w-16 h-16 text-rose-400" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-white to-indigo-300"
          >
            Access Denied
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 mb-8 text-lg"
          >
            You don't have permission to access this page. Admin privileges are required.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onGoHome}
              className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-rose-500 opacity-100 group-hover:opacity-90 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2 text-white">
                <Home className="w-5 h-5" />
                Go to Home
              </div>
            </button>

            {isAuthenticated && onLogout && (
              <button
                onClick={onLogout}
                className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden border border-white/10"
              >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                <div className="relative flex items-center justify-center gap-2 text-white/70 group-hover:text-white">
                  <LogOut className="w-5 h-5" />
                  Logout
                </div>
              </button>
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-white/40"
          >
            If you believe you should have access, please contact the administrator.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
