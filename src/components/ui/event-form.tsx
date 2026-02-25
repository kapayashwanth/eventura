"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, X, Image, FileText, Tag, Users, Upload, Link, ExternalLink } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface EventFormProps {
  event?: any;
  onClose: () => void;
  onSaved?: () => void;
}

export function EventForm({ event, onClose, onSaved }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [category, setCategory] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [posterMode, setPosterMode] = useState<"link" | "upload">("link");
  const [uploading, setUploading] = useState(false);
  const [uploadedStorageId, setUploadedStorageId] = useState<Id<"_storage"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const generateUploadUrl = useMutation(api.events.generateUploadUrl);
  const storageUrl = useQuery(
    api.events.getStorageUrl,
    uploadedStorageId ? { storageId: uploadedStorageId } : "skip"
  );

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setEventDate(event.event_date || "");
      setEventTime(event.event_time || "");
      setLocation(event.location || "");
      setStatus(event.status || "upcoming");
      setCategory(event.category || "");
      setBannerImage(event.banner_image || "");
      setRegistrationLink(event.registration_link || "");
      setApplicationDeadline(event.application_deadline || "");
      setMaxParticipants(event.max_participants?.toString() || "");
      if (event.banner_image) {
        setPosterMode("link");
      }
    }
  }, [event]);

  // When storage URL resolves after upload, set it as the banner image
  useEffect(() => {
    if (storageUrl) {
      setBannerImage(storageUrl);
    }
  }, [storageUrl]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WEBP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }
    try {
      setUploading(true);
      setError("");
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) {
        throw new Error(`Upload failed with status ${result.status}`);
      }
      const json = await result.json();
      if (!json.storageId) {
        throw new Error("No storageId returned from upload");
      }
      setUploadedStorageId(json.storageId);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Title is required"); return; }
    if (!eventDate) { setError("Event date is required"); return; }

    try {
      setSaving(true);
      setError("");

      const data: any = {
        title,
        description: description || undefined,
        event_date: eventDate,
        event_time: eventTime || undefined,
        location: location || undefined,
        status,
        category: category || undefined,
        banner_image: bannerImage || undefined,
        registration_link: registrationLink || undefined,
        application_deadline: applicationDeadline || undefined,
        max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
      };

      if (event) {
        await updateEvent({ id: event._id, ...data });
      } else {
        await createEvent(data);
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error("Error saving event:", err);
      setError(err.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <FileText className="w-4 h-4" />Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <FileText className="w-4 h-4" />Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Calendar className="w-4 h-4" />Event Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Clock className="w-4 h-4" />Event Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <MapPin className="w-4 h-4" />Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Event location"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Tag className="w-4 h-4" />Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="upcoming" className="bg-gray-800">Upcoming</option>
                <option value="past" className="bg-gray-800">Past</option>
                <option value="cancelled" className="bg-gray-800">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Tag className="w-4 h-4" />Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g., Workshop, Seminar"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Image className="w-4 h-4" />Event Poster
            </label>
            {/* Toggle: Link vs Upload */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setPosterMode("link"); setUploadedStorageId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  posterMode === "link"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                Paste URL
              </button>
              <button
                type="button"
                onClick={() => { setPosterMode("upload"); setBannerImage(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  posterMode === "upload"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image
              </button>
            </div>

            {posterMode === "link" ? (
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://example.com/poster.jpg"
              />
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl bg-white/5 border-2 border-dashed border-white/10 hover:border-indigo-500/40 cursor-pointer transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-white/40 text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/30" />
                      <span className="text-white/40 text-sm">Click or drag & drop an image here</span>
                      <span className="text-white/20 text-xs">PNG, JPG, WEBP — Max 10MB</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {bannerImage && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-white/10">
                <img src={bannerImage} alt="Poster preview" className="w-full h-40 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <button
                  type="button"
                  onClick={() => { setBannerImage(""); setUploadedStorageId(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <ExternalLink className="w-4 h-4" />Registration / Application Link
            </label>
            <input
              type="url"
              value={registrationLink}
              onChange={(e) => setRegistrationLink(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="https://forms.google.com/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Calendar className="w-4 h-4" />Application Deadline
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Users className="w-4 h-4" />Max Participants
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
