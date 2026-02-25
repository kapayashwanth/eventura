"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface EventRegistrationButtonProps {
  eventId: Id<"events">;
  onLoginRequired?: () => void;
  onProfileRequired?: () => void;
}

export function EventRegistrationButton({ eventId, onLoginRequired, onProfileRequired }: EventRegistrationButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profile = useQuery(
    api.userProfiles.getProfileFields,
    user ? { firebase_uid: user.uid } : "skip"
  );

  const status = useQuery(
    api.eventApplications.checkStatus,
    user ? { user_id: user.uid, event_id: eventId } : "skip"
  );
  const toggleApplication = useMutation(api.eventApplications.toggle);
  const sendReminder = useAction(api.emails.sendReminder);

  const isApplied = status?.is_applied === true;

  const isProfileComplete = !!(profile && profile.mobile_number && profile.department && profile.year_of_study);

  const handleToggle = async () => {
    if (!isAuthenticated || !user) {
      onLoginRequired?.();
      return;
    }

    if (!isProfileComplete) {
      onProfileRequired?.();
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await toggleApplication({
        user_id: user.uid,
        event_id: eventId,
      });
      // Send reminder email when setting a reminder (not when removing)
      if (result.is_applied) {
        sendReminder({ user_id: user.uid, event_id: eventId }).catch((err) =>
          console.log("Reminder email:", err.message)
        );
      }
    } catch (err: any) {
      console.error("Error toggling reminder:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 h-full
          ${isApplied
            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
            : "bg-gradient-to-r from-indigo-500 to-rose-500 text-white hover:from-indigo-600 hover:to-rose-600 shadow-lg shadow-indigo-500/25"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isApplied ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span className="group-hover:hidden">Reminded</span>
          </>
        ) : (
          "Remind Me"
        )}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
