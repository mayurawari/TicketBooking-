"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Booking, Seat } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Ticket,
  Film,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
} from "lucide-react";

interface GroupedBooking {
  reference: string;
  event?: Booking["event"];
  status: Booking["status"];
  totalAmount: number;
  seats: Array<{
    id: number;
    seatId: number;
    seat?: Seat;
    price: number;
    isScanned?: boolean;
  }>;
  createdAt: string;
  bookingIds: number[];
}

export default function MyBookingsPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingRef, setCancellingRef] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"ALL" | "CONFIRMED" | "CANCELLED">("ALL");

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

  // Group multiple seat rows by bookingReference (or eventId + date fallback)
  const groupedBookings = useMemo(() => {
    const map = new Map<string, GroupedBooking>();

    bookings.forEach((b) => {
      // Use bookingReference if available, or synthesize unique key for legacy rows
      const key = b.bookingReference || `LEGACY-${b.eventId}-${new Date(b.createdAt).toDateString()}-${b.id}`;

      if (!map.has(key)) {
        map.set(key, {
          reference: b.bookingReference || `BMS-PASS-${b.id}`,
          event: b.event,
          status: b.status,
          totalAmount: 0,
          seats: [],
          createdAt: b.createdAt,
          bookingIds: [],
        });
      }

      const group = map.get(key)!;
      group.totalAmount += b.totalAmount || 0;
      group.bookingIds.push(b.id);
      group.seats.push({
        id: b.id,
        seatId: b.seatId,
        seat: b.seat,
        price: b.totalAmount,
        isScanned: b.isScanned,
      });

      // If any active ticket in group is confirmed, mark as confirmed
      if (b.status === "CONFIRMED") {
        group.status = "CONFIRMED";
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings]);

  const filteredGroups = useMemo(() => {
    if (filterTab === "ALL") return groupedBookings;
    return groupedBookings.filter((g) => g.status === filterTab);
  }, [groupedBookings, filterTab]);

  const handleCopyShareLink = (reference: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/tickets/view/${reference}`;
      navigator.clipboard.writeText(url);
      setCopiedRef(reference);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const handleCancelGroup = async (group: GroupedBooking) => {
    if (
      !confirm(
        `Are you sure you want to cancel ${group.seats.length} seat(s) for ${group.event?.title}? The seats will be freed immediately.`
      )
    ) {
      return;
    }

    setCancellingRef(group.reference);
    setActionMessage(null);

    try {
      // Cancel each booking in the group
      for (const id of group.bookingIds) {
        await api.patch(`/api/booking/cancelbooking/${id}`);
      }

      setActionMessage({ text: "Ticket reservation successfully cancelled.", type: "success" });
      setBookings((prev) =>
        prev.map((b) => (group.bookingIds.includes(b.id) ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Error cancelling ticket", type: "error" });
    } finally {
      setCancellingRef(null);
    }
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="inline-block h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Loading your cinema bookings...</p>
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
            Please log in with your account to access your digital ticket passes and seat reservations.
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Ticket className="h-3.5 w-3.5" />
            <span>Digital Passes</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Movie Tickets</h1>
          <p className="text-sm text-zinc-400 mt-1">
            BookMyShow standard unified digital ticket passes with split friend-sharing links
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              filterTab === tab
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {tab === "ALL" ? "All Tickets" : tab === "CONFIRMED" ? "Active Passes" : "Cancelled"}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center text-sm text-red-400">
          {error}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-zinc-900/50 border border-zinc-800 p-16 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
            <Ticket className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No tickets found</h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              You don&apos;t have any tickets in this view. Browse upcoming movie screenings to reserve seats!
            </p>
          </div>
          <Link
            href="/events"
            className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const isConfirmed = group.status === "CONFIRMED";
            const isCancelled = group.status === "CANCELLED";
            const seatNames = group.seats
              .map((s) => (s.seat ? `${s.seat.row}${s.seat.seatNumber}` : `Seat #${s.seatId}`))
              .join(", ");
            const showDate = group.event?.releaseDate
              ? new Date(group.event.releaseDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Upcoming Show";

            return (
              <div
                key={group.reference}
                className="group relative flex flex-col md:flex-row overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-xl"
              >
                {/* Left Ticket Color Accent Notch */}
                <div
                  className={`hidden md:block w-3 ${
                    isConfirmed
                      ? "bg-gradient-to-b from-rose-600 via-amber-500 to-rose-600"
                      : "bg-zinc-800"
                  }`}
                />

                {/* Movie Poster Thumbnail */}
                <div className="relative aspect-[16/9] md:aspect-square md:w-48 flex-shrink-0 bg-zinc-950 overflow-hidden">
                  {group.event?.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={group.event.poster}
                      alt={group.event.title || "Movie Poster"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <Film className="h-10 w-10" />
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3 md:hidden">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md"
                          : "bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md"
                      }`}
                    >
                      {group.status}
                    </span>
                  </div>
                </div>

                {/* Ticket Details & Master Booking Information */}
                <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="hidden md:flex items-center gap-2 mb-1">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isConfirmed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {group.status}
                        </span>
                        <span className="text-xs text-amber-400 font-mono font-bold">
                          Pass: {group.reference}
                        </span>
                      </div>

                      <h3 className="text-2xl font-extrabold text-white group-hover:text-rose-400 transition-colors">
                        {group.event?.title || "Movie Screening"}
                      </h3>

                      {group.event?.venue && (
                        <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0" />
                          <span>
                            {group.event.venue.name} • {group.event.venue.city}
                          </span>
                        </p>
                      )}

                      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                        <span>{showDate}</span>
                      </p>
                    </div>

                    {/* Master Seat Badge & Price Callout */}
                    <div className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-3.5 text-left sm:text-right space-y-1 sm:min-w-[180px]">
                      <div className="text-[10px] uppercase font-semibold text-zinc-400">
                        {group.seats.length} {group.seats.length === 1 ? "Ticket" : "Tickets"}
                      </div>
                      <div className="text-xl font-extrabold text-white font-mono tracking-tight">
                        {seatNames}
                      </div>
                      <div className="text-sm font-extrabold text-rose-400 font-mono">
                        Total: ₹{group.totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar: View Digital M-Ticket, Share Link, Cancel */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
                    <div className="text-xs text-zinc-500 font-mono">
                      Booked on {new Date(group.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Digital Pass Button */}
                      <Link
                        href={`/tickets/view/${group.reference}`}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 text-xs font-semibold transition-all shadow"
                      >
                        <QrCode className="h-3.5 w-3.5 text-amber-400" />
                        <span>View Digital Pass</span>
                      </Link>

                      {/* Share Link Button */}
                      <button
                        onClick={() => handleCopyShareLink(group.reference)}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-2 text-xs font-semibold transition-all cursor-pointer"
                        title="Share ticket link with friends"
                      >
                        {copiedRef === group.reference ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5 text-rose-400" />
                            <span>Share</span>
                          </>
                        )}
                      </button>

                      {/* Cancel Booking Button */}
                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelGroup(group)}
                          disabled={cancellingRef === group.reference}
                          className="rounded-xl bg-zinc-800/60 hover:bg-red-950/60 hover:text-red-400 border border-zinc-700/60 px-3 py-2 text-xs font-semibold text-zinc-400 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {cancellingRef === group.reference ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
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
