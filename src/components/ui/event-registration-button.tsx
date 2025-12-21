"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface EventRegistrationButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  applicationDeadline?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export function EventRegistrationButton({
  eventId,
  eventTitle,
  eventDate,
  applicationDeadline,
  className = "",
  variant = "primary"
}: EventRegistrationButtonProps) {
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndApplicationStatus();
  }, [eventId]);

  const checkAuthAndApplicationStatus = async () => {
    if (!supabase) {
      setCheckingStatus(false);
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (!session) {
        setCheckingStatus(false);
        return;
      }

      // Check if user has marked this event as applied
      const { data, error } = await supabase
        .rpc('check_event_application_status', { p_event_id: eventId });

      if (error) {
        console.error("Error checking application status:", error);
      } else {
        const status = data as { is_applied: boolean; applied_at?: string };
        setIsApplied(status.is_applied);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleToggleApplication = async () => {
    if (!supabase) {
      setMessage("Application system not configured");
      return;
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessage("Please login to mark events as applied");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .rpc('toggle_event_application', { p_event_id: eventId });

      if (error) throw error;

      const result = data as { success: boolean; is_applied: boolean; message: string };
      
      if (result.success) {
        setIsApplied(result.is_applied);
        setMessage(result.message);
      } else {
        setMessage(result.message || "Operation failed");
      }
    } catch (err: any) {
      console.error("Application toggle error:", err);
      setMessage(err.message || "Failed to update. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const getButtonContent = () => {
    if (checkingStatus) {
      return (
        <>
          <Clock className="w-4 h-4 animate-spin" />
          <span>Checking...</span>
        </>
      );
    }

    if (isApplied) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Applied ✓</span>
        </>
      );
    }

    return (
      <>
        <Plus className="w-4 h-4" />
        <span>Mark as Applied</span>
      </>
    );
  };

  const buttonStyles = isApplied
    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
    : variant === "primary" 
      ? "bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600"
      : "bg-white/10 border border-white/20 hover:bg-white/20";

  return (
    <div className="space-y-2">
      <motion.button
        whileHover={!isLoading && !checkingStatus ? { scale: 1.02 } : {}}
        whileTap={!isLoading && !checkingStatus ? { scale: 0.98 } : {}}
        onClick={handleToggleApplication}
        disabled={isLoading || checkingStatus}
        className={`
          w-full px-6 py-3 rounded-xl font-semibold text-white
          transition-all duration-300 flex items-center justify-center gap-2
          ${buttonStyles}
          ${(isLoading || checkingStatus) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'}
          ${className}
        `}
        title={isApplied ? "Click to remove from applied events" : "Click to receive reminder emails before deadline"}
      >
        {getButtonContent()}
      </motion.button>

      {/* Deadline Info */}
      {applicationDeadline && !isApplied && (
        <div className="flex items-center justify-center gap-1 text-xs text-white/60">
          <Clock className="w-3 h-3" />
          <span>Deadline: {new Date(applicationDeadline).toLocaleDateString()}</span>
        </div>
      )}

      {/* Success/Error Message - Only show errors */}
      {message && !message.includes('Marked as applied') && !message.includes('receive reminder') && !message.includes('Removed') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
