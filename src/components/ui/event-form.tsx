"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Save, X, Calendar, Clock, MapPin, Link, Tag, Users, Upload, Image as ImageIcon } from "lucide-react";
import { supabase, Event } from "@/lib/supabase";

interface EventFormProps {
  event?: Event | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    application_deadline: "",
    registration_link: "",
    location: "",
    organizer: "",
    category: "general" as Event["category"],
    max_participants: "",
    banner_image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        event_date: event.event_date ? event.event_date.slice(0, 16) : "",
        application_deadline: event.application_deadline ? event.application_deadline.slice(0, 16) : "",
        registration_link: event.registration_link || "",
        location: event.location || "",
        organizer: event.organizer || "",
        category: event.category || "general",
        max_participants: event.max_participants?.toString() || "",
        banner_image: event.banner_image || "",
      });
      if (event.banner_image) {
        setImagePreview(event.banner_image);
      }
    }
  }, [event]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !supabase) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `event-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      // Upload image if new file selected
      let bannerUrl = formData.banner_image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          bannerUrl = uploadedUrl;
        }
      }

      // Calculate status based on application deadline (if set) or event date
      const now = new Date();
      let status: 'past' | 'upcoming';
      
      if (formData.application_deadline) {
        // If deadline is set, use deadline to determine status
        const deadline = new Date(formData.application_deadline);
        status = deadline < now ? 'past' : 'upcoming';
      } else {
        // Fallback to event date if no deadline set
        const eventDate = new Date(formData.event_date);
        status = eventDate < now ? 'past' : 'upcoming';
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        application_deadline: formData.application_deadline || null,
        registration_link: formData.registration_link || null,
        location: formData.location || null,
        organizer: formData.organizer || null,
        category: formData.category,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        banner_image: bannerUrl || null,
        status: status,
      };

      if (event?.id) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id);

        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from("events")
          .insert([eventData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <button
            onClick={onCancel}
            className="text-white/50 hover:text-white/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="AI/ML Hackathon 2025"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              placeholder="Brief description of the event..."
            />
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Calendar className="w-4 h-4" />
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Clock className="w-4 h-4" />
                Application Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <p className="text-xs text-white/40 mt-1">When applications close (optional)</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
              <Tag className="w-4 h-4" />
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Event["category"] })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="general">General</option>
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="tech-talk">Tech Talk</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="competition">Competition</option>
              <option value="webinar">Webinar</option>
            </select>
          </div>

          {/* Location and Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Seminar Hall A"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Users className="w-4 h-4" />
                Organizer
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Computer Science Dept"
              />
            </div>
          </div>

          {/* Registration Link and Max Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Link className="w-4 h-4" />
                Registration Link
              </label>
              <input
                type="url"
                value={formData.registration_link}
                onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="https://forms.google.com/..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Users className="w-4 h-4" />
                Max Participants
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="100"
                min="1"
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
              <ImageIcon className="w-4 h-4" />
              Event Banner Image
            </label>
            
            {imagePreview && (
              <div className="mb-4 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setImageFile(null);
                    setFormData({ ...formData, banner_image: "" });
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-all bg-white/5">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-white/50 mb-2" />
                <p className="text-sm text-white/50">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-white/30">PNG, JPG or WEBP (MAX. 5MB)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            <p className="text-xs text-white/30 mt-2">
              Or paste image URL:
            </p>
            <input
              type="url"
              value={formData.banner_image}
              onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
              className="w-full px-4 py-2 mt-1 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{event ? "Update Event" : "Create Event"}</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
