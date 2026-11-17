"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Ticket,
  Film,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function MyBookingsPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ message: string; bookings: Booking[] }>("/api/booking/mybookings");
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(
        err?.status === 401
          ? "Please sign in to view your bookings."
          : (err?.message || "Failed to load bookings")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking? The seat will be released immediately.")) {
      return;
    }

    setCancellingId(bookingId);
    setActionMessage(null);

    try {
      await api.patch(`/api/booking/cancelbooking/${bookingId}`);
      setActionMessage({ text: "Booking successfully cancelled.", type: "success" });
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Error cancelling booking", type: "error" });
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="inline-block h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Loading your booked tickets...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-500 border border-rose-500/20">
          <Ticket className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Sign In to View Passes</h2>
          <p className="text-sm text-zinc-400">
            Please log in with your account to access your reserved tickets and cinema passes.
          </p>
        </div>
        <Link
          href="/login?returnUrl=/my-bookings"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          <span>Sign In</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Ticket className="h-7 w-7 text-rose-500" />
            <span>My Ticket Passes</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your movie reservations, view showtimes, or cancel seats
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm ${
            actionMessage.type === "success"
              ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
              : "bg-red-950/40 border border-red-800/60 text-red-300"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center text-sm text-red-400">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-zinc-900/50 border border-zinc-800 p-16 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
            <Ticket className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No active ticket bookings</h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              You haven&apos;t booked any movie tickets yet. Explore upcoming movies to reserve your seats!
            </p>
          </div>
          <Link
            href="/events"
            className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === "CANCELLED";
            const isConfirmed = booking.status === "CONFIRMED";

            return (
              <div
                key={booking.id}
                className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-md"
              >
                {/* Left Ticket Border Notch Detail */}
                <div className="hidden md:block w-2 bg-gradient-to-b from-rose-600 to-amber-600" />

                {/* Event Poster / Fallback */}
                <div className="relative aspect-[16/9] md:aspect-square md:w-44 flex-shrink-0 bg-zinc-950 overflow-hidden">
                  {booking.event?.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.event.poster}
                      alt={booking.event.title || "Movie Poster"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <Film className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/* Ticket Details */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isConfirmed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isCancelled
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          Pass #{booking.id.toString().padStart(5, "0")}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                        {booking.event?.title || "Movie Event"}
                      </h3>

                      {booking.event?.venue && (
                        <p className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                          <span>
                            {booking.event.venue.name} • {booking.event.venue.city}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Seat & Price Callout */}
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-zinc-400">Seat Reserved</div>
                      <div className="text-lg font-extrabold text-white font-mono">
                        Row {booking.seat?.row} - Seat {booking.seat?.seatNumber}
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        {booking.seat?.type} (₹{booking.totalAmount})
                      </span>
                    </div>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      <span>
                        Booked on {new Date(booking.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="rounded-lg bg-zinc-800 hover:bg-red-950/60 hover:text-red-400 border border-zinc-700/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel Ticket"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

