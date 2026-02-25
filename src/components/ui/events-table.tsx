"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Edit2, Trash2, Eye } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  status?: string;
  category?: string;
  banner_image?: string;
  _creationTime: number;
}

interface EventsTableProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onView?: (event: Event) => void;
}

export function EventsTable({ events, onEdit, onDelete, onView }: EventsTableProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/40">No events found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Location</th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {event.banner_image && (
                      <img src={event.banner_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{event.title}</p>
                      {event.category && <p className="text-white/40 text-xs">{event.category}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/70 text-sm">
                  {event.event_date ? new Date(event.event_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-white/70 text-sm">{event.location || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'upcoming' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    event.status === 'past' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {event.status || "draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button onClick={() => onView(event)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-white/60" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(event)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4 text-indigo-400" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => { if (confirm("Delete this event?")) onDelete(event._id); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {events.map((event) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="text-white font-medium">{event.title}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.event_date && (
                    <span className="flex items-center gap-1 text-white/40 text-xs">
                      <Calendar className="w-3 h-3" />{new Date(event.event_date).toLocaleDateString()}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1 text-white/40 text-xs">
                      <MapPin className="w-3 h-3" />{event.location}
                    </span>
                  )}
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'upcoming' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                event.status === 'past' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {event.status || "draft"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              {onView && (
                <button onClick={() => onView(event)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 text-sm transition-colors">View</button>
              )}
              {onEdit && (
                <button onClick={() => onEdit(event)} className="flex-1 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-300 text-sm transition-colors">Edit</button>
              )}
              {onDelete && (
                <button onClick={() => { if (confirm("Delete this event?")) onDelete(event._id); }} className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors">Delete</button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
