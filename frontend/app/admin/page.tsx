"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Event, Venue, Booking } from "@/lib/types";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  Building2,
  Film,
  Ticket,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "venues" | "events" | "bookings">("overview");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Venue Modal Form State
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: "",
    city: "",
    address: "",
    type: "MULTIPLEX" as "MULTIPLEX" | "THEATRE",
    totalSeats: 200,
    totalScreens: 2,
  });

  // New Event Modal Form State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    releaseDate: "",
    poster: "",
    rating: 8.5,
    venueId: 1,
  });

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const [venuesRes, eventsRes, bookingsRes] = await Promise.allSettled([
        api.get<{ venues: Venue[] }>("/api/venue/getvenues"),
        api.get<{ allevents: Event[] }>("/api/event/getevents"),
        api.get<{ bookings: Booking[] }>("/api/booking/allbookings"),
      ]);

      if (venuesRes.status === "fulfilled") setVenues(venuesRes.value.venues || []);
      if (eventsRes.status === "fulfilled") setEvents(eventsRes.value.allevents || []);
      if (bookingsRes.status === "fulfilled") setAllBookings(bookingsRes.value.bookings || []);
    } catch (err: any) {
      setFeedback({ text: err?.message || "Error loading admin data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Handle Venue Creation
  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await api.post("/api/venue/createvenue", {
        ...newVenue,
        totalSeats: Number(newVenue.totalSeats),
        totalScreens: Number(newVenue.totalScreens),
      });
      setFeedback({ text: "Venue created successfully!", type: "success" });
      setIsVenueModalOpen(false);
      setNewVenue({
        name: "",
        city: "",
        address: "",
        type: "MULTIPLEX",
        totalSeats: 200,
        totalScreens: 2,
      });
      loadAdminData();
    } catch (err: any) {
      setFeedback({ text: err?.message || "Error creating venue", type: "error" });
    }
  };

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await api.post("/api/event/createevent", {
        ...newEvent,
        rating: Number(newEvent.rating),
        venueId: Number(newEvent.venueId),
        releaseDate: newEvent.releaseDate || null,
      });
      setFeedback({ text: "Event created successfully!", type: "success" });
      setIsEventModalOpen(false);
      setNewEvent({
        title: "",
        description: "",
        releaseDate: "",
        poster: "",
        rating: 8.5,
        venueId: venues[0]?.id || 1,
      });
      loadAdminData();
    } catch (err: any) {
      setFeedback({ text: err?.message || "Error creating event", type: "error" });
    }
  };

  // Handle Deleting Venue
  const handleDeleteVenue = async (id: number) => {
    if (!confirm(`Are you sure you want to delete venue #${id} and all related records?`)) return;
    try {
      await api.delete(`/api/venue/deletevenue/${id}`);
      setFeedback({ text: `Venue #${id} deleted successfully.`, type: "success" });
      loadAdminData();
    } catch (err: any) {
      setFeedback({ text: err?.message || "Failed to delete venue", type: "error" });
    }
  };

  // Handle Deleting Event
  const handleDeleteEvent = async (id: number) => {
    if (!confirm(`Are you sure you want to delete event #${id}?`)) return;
    try {
      await api.delete(`/api/event/deleteevent/${id}`);
      setFeedback({ text: `Event #${id} deleted successfully.`, type: "success" });
      loadAdminData();
    } catch (err: any) {
      setFeedback({ text: err?.message || "Failed to delete event", type: "error" });
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="inline-block h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Verifying administrator authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 text-red-500 border border-red-500/20">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Administrator Access Required</h2>
          <p className="text-sm text-zinc-400">
            This portal is restricted to accounts with administrative role privileges. Please sign in with an admin account.
          </p>
        </div>
        <Link
          href="/login?returnUrl=/admin"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          <span>Sign In as Admin</span>
        </Link>
      </div>
    );
  }

  const totalRevenue = allBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Administration</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage venues, cinema screenings, and monitor global ticket reservations
          </p>
        </div>
        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
              : "bg-red-950/40 border border-red-800/60 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        {(["overview", "venues", "events", "bookings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-rose-600 text-white shadow-sm"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Bookings</span>
                <Ticket className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{allBookings.length}</div>
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Revenue Generated</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">₹{totalRevenue}</div>
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Active Venues</span>
                <Building2 className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{venues.length}</div>
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Active Events</span>
                <Film className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{events.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Venues Tab */}
      {activeTab === "venues" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Cinemas & Venues</h3>
            <button
              onClick={() => setIsVenueModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Venue</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase font-mono">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Screens</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {venues.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-800/40">
                    <td className="p-4 font-mono font-bold text-white">{v.id}</td>
                    <td className="p-4 font-medium text-white">{v.name}</td>
                    <td className="p-4">{v.city}</td>
                    <td className="p-4">{v.type}</td>
                    <td className="p-4">{v.totalScreens}</td>
                    <td className="p-4">{v.totalSeats}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteVenue(v.id)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete Venue"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Event Screenings</h3>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase font-mono">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Venue ID</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Release</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-800/40">
                    <td className="p-4 font-mono font-bold text-white">{e.id}</td>
                    <td className="p-4 font-medium text-white">{e.title}</td>
                    <td className="p-4 font-mono">Venue #{e.venueId}</td>
                    <td className="p-4">⭐ {e.rating || "N/A"}</td>
                    <td className="p-4">
                      {e.releaseDate ? new Date(e.releaseDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">System Bookings</h3>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase font-mono">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Seat</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/40">
                    <td className="p-4 font-mono font-bold text-white">#{b.id}</td>
                    <td className="p-4">{b.user?.email || `User #${b.userId}`}</td>
                    <td className="p-4 font-medium text-white">{b.event?.title || `Event #${b.eventId}`}</td>
                    <td className="p-4 font-mono">
                      {b.seat ? `${b.seat.row}${b.seat.seatNumber}` : `Seat #${b.seatId}`}
                    </td>
                    <td className="p-4 font-mono text-emerald-400">₹{b.totalAmount}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : b.status === "CANCELLED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Venue */}
      {isVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Venue</h3>
            <form onSubmit={handleCreateVenue} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  placeholder="PVR Cinemas"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newVenue.city}
                    onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Type</label>
                  <select
                    value={newVenue.type}
                    onChange={(e) => setNewVenue({ ...newVenue, type: e.target.value as any })}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                  >
                    <option value="MULTIPLEX">MULTIPLEX</option>
                    <option value="THEATRE">THEATRE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                  placeholder="Full street address..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Total Screens</label>
                  <input
                    type="number"
                    required
                    value={newVenue.totalScreens}
                    onChange={(e) => setNewVenue({ ...newVenue, totalScreens: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={newVenue.totalSeats}
                    onChange={(e) => setNewVenue({ ...newVenue, totalSeats: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(false)}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Movie / Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Inception: Special Screening"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Venue</label>
                <select
                  value={newEvent.venueId}
                  onChange={(e) => setNewEvent({ ...newEvent, venueId: Number(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Synopsis of the movie..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Rating (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={newEvent.rating}
                    onChange={(e) => setNewEvent({ ...newEvent, rating: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Release Date</label>
                  <input
                    type="date"
                    value={newEvent.releaseDate}
                    onChange={(e) => setNewEvent({ ...newEvent, releaseDate: e.target.value })}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Poster Image URL</label>
                <input
                  type="url"
                  value={newEvent.poster}
                  onChange={(e) => setNewEvent({ ...newEvent, poster: e.target.value })}
                  placeholder="https://image-url.com/poster.jpg"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-500"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
