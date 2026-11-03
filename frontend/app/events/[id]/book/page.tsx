"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event, Seat, BookedSeatItem, Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SEAT_PRICING, SEAT_COLORS } from "@/lib/constants";
import {
  Film,
  ArrowLeft,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Tv,
  Info,
  Sparkles,
  Lock,
} from "lucide-react";

export default function BookSeatsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<number>>(new Set());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Load Event, Venue, and Seat layouts
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      setBookingError(null);
      try {
        // 1. Fetch Event
        const eventRes = await api.get<{ message: string; getevent: Event }>(
          `/api/event/oneevent/${eventId}`
        );
        const currentEvent = eventRes.getevent;
        setEvent(currentEvent);

        if (!currentEvent || !currentEvent.venueId) {
          throw new Error("Event or Venue ID not found");
        }

        // 2. Fetch Venue Details
        try {
          const venueRes = await api.get<{ message: string; venue: Venue }>(
            `/api/venue/getvenue/${currentEvent.venueId}`
          );
          setVenue(venueRes.venue);
        } catch {
          // Venue lookup optional
        }

        // 3. Fetch Venue Seats
        const seatsRes = await api.get<{ Message: string; seats: Seat[] }>(
          `/api/seat/venues/${currentEvent.venueId}/seats`
        );
        setSeats(seatsRes.seats || []);

        // 4. Fetch already booked seats for this event
        const bookedRes = await api.get<{ message: string; bookedSeats: BookedSeatItem[] }>(
          `/api/booking/event/${eventId}/booked-seats`
        );
        const bookedIds = new Set<number>((bookedRes.bookedSeats || []).map((b) => b.seatId));
        setBookedSeatIds(bookedIds);
      } catch (err: any) {
        setBookingError(
          err?.status === 401
            ? "You must be signed in to view and select seats."
            : (err?.message || "Error loading seat map.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, [eventId]);

  // Group seats by Row (sorted alphabetically: A, B, C...)
  const rowsMap = useMemo(() => {
    const map = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      const rowKey = seat.row.toUpperCase();
      if (!map.has(rowKey)) {
        map.set(rowKey, []);
      }
      map.get(rowKey)!.push(seat);
    });

    // Sort rows alphabetically and sort seats by seatNumber numerically
    const sortedEntries = Array.from(map.entries()).sort(([rowA], [rowB]) =>
      rowA.localeCompare(rowB)
    );

    sortedEntries.forEach(([, rowSeats]) => {
      rowSeats.sort((a, b) => {
        const numA = parseInt(a.seatNumber.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.seatNumber.replace(/\D/g, "")) || 0;
        return numA - numB;
      });
    });

    return sortedEntries;
  }, [seats]);

  // Toggle seat selection
  const handleSeatClick = (seat: Seat) => {
    if (bookedSeatIds.has(seat.id)) return; // Can't select booked seats

    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  // Calculate total price
  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      const price = SEAT_PRICING[seat.type] || 200;
      return sum + price;
    }, 0);
  }, [selectedSeats]);

  // Execute Booking
  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/events/${eventId}/book`);
      return;
    }

    if (selectedSeats.length === 0) return;

    setIsBooking(true);
    setBookingError(null);

    try {
      // Create bookings sequentially for each selected seat
      for (const seat of selectedSeats) {
        const price = SEAT_PRICING[seat.type] || 200;
        await api.post("/api/booking/createbooking", {
          eventId: Number(eventId),
          seatId: seat.id,
          totalAmount: price,
          status: "CONFIRMED",
        });
      }

      setBookingSuccess(true);
      setTimeout(() => {
        router.push("/my-bookings");
      }, 1500);
    } catch (err: any) {
      if (err?.status === 409) {
        setBookingError("One or more selected seats were just reserved by another guest. Please pick other seats.");
      } else {
        setBookingError(err?.message || "Booking failed. Please try again.");
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="inline-block h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Loading cinema layout and seat availability...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-500 border border-rose-500/20">
          <Lock className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
          <p className="text-sm text-zinc-400">
            Please log in or create an account to view live seating maps and confirm your ticket reservation.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/events"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-2.5 text-sm text-zinc-300 hover:text-white"
          >
            Back to Movies
          </Link>
          <Link
            href={`/login?returnUrl=/events/${eventId}/book`}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar / Event Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Movie Details</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{event?.title}</span>
            {venue && (
              <span className="text-xs font-normal text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                {venue.name} • {venue.city}
              </span>
            )}
          </h1>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-purple-600" />
            <span className="text-zinc-300">Luxury (₹500)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-indigo-600" />
            <span className="text-zinc-300">Platinum (₹350)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-600" />
            <span className="text-zinc-300">Gold (₹250)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-slate-600" />
            <span className="text-zinc-300">Silver (₹180)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-teal-600" />
            <span className="text-zinc-300">Front (₹120)</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-700">
            <span className="h-3 w-3 rounded bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-500 flex items-center justify-center font-bold">
              ✕
            </span>
            <span className="text-zinc-400">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500 ring-2 ring-emerald-300" />
            <span className="text-emerald-400 font-semibold">Selected</span>
          </div>
        </div>
      </div>

      {bookingError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/60 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <span>{bookingError}</span>
        </div>
      )}

      {bookingSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 p-4 text-sm text-emerald-300 animate-bounce">
          <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-400" />
          <div>
            <p className="font-bold">Seats reserved successfully!</p>
            <p className="text-xs text-emerald-400/80">Redirecting to your ticket pass...</p>
          </div>
        </div>
      )}

      {/* Main Seating Layout & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Theatre Seating Screen & Grid */}
        <div className="lg:col-span-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 space-y-10 overflow-x-auto">
          {/* Cinema Screen Curved Indicator */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-3/4 h-2.5 rounded-full bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_rgba(244,63,94,0.6)]" />
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
              Cinema Screen This Way
            </span>
          </div>

          {/* Seat Grid by Row */}
          <div className="min-w-[500px] flex flex-col items-center space-y-3.5">
            {rowsMap.map(([rowLetter, rowSeats]) => (
              <div key={rowLetter} className="flex items-center gap-4">
                {/* Row Indicator Left */}
                <span className="w-5 text-center text-xs font-bold text-zinc-500">
                  {rowLetter}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center gap-1.5">
                  {rowSeats.map((seat) => {
                    const isBooked = bookedSeatIds.has(seat.id);
                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    const tierStyle = SEAT_COLORS[seat.type] || SEAT_COLORS.SILVER;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isBooked || isBooking}
                        onClick={() => handleSeatClick(seat)}
                        title={`${seat.row}${seat.seatNumber} • ${seat.type} (₹${SEAT_PRICING[seat.type]})`}
                        className={`h-7 w-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isBooked
                            ? "bg-zinc-800/80 text-zinc-600 border border-zinc-700/50 cursor-not-allowed opacity-40"
                            : isSelected
                            ? "bg-emerald-500 text-white ring-2 ring-emerald-300 scale-110 shadow-lg shadow-emerald-950"
                            : `${tierStyle.bg} text-white shadow-sm hover:scale-105`
                        }`}
                      >
                        {isBooked ? "✕" : seat.seatNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Row Indicator Right */}
                <span className="w-5 text-center text-xs font-bold text-zinc-500">
                  {rowLetter}
                </span>
              </div>
            ))}
          </div>

          {/* Seat Map Footnote */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 border-t border-zinc-800/60 pt-4">
            <Info className="h-3.5 w-3.5" />
            <span>Click any available seat to toggle selection. Tiers reflect venue pricing.</span>
          </div>
        </div>

        {/* Booking Summary Panel */}
        <div className="lg:col-span-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 sticky top-24 shadow-xl">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Booking Summary</h3>
              <p className="text-xs text-zinc-400">Transparent pricing & instant reservation</p>
            </div>
          </div>

          {/* Selected Seat Badges */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Selected Seats:</span>
              <span className="font-semibold text-white">
                {selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"}
              </span>
            </div>

            {selectedSeats.length === 0 ? (
              <div className="rounded-xl bg-zinc-950 border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                No seats selected yet. Please click on the seating map to pick your spot.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {selectedSeats.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs text-zinc-200"
                  >
                    <span className="font-mono font-bold text-emerald-400">
                      {s.row}{s.seatNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase">({s.type})</span>
                    <span className="text-[10px] text-zinc-300 font-semibold">
                      ₹{SEAT_PRICING[s.type]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Calculation Breakdown */}
          {selectedSeats.length > 0 && (
            <div className="space-y-2 border-t border-zinc-800 pt-4 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({selectedSeats.length} seats)</span>
                <span className="text-white font-mono">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Convenience Fee & Taxes</span>
                <span className="text-emerald-400 font-semibold font-mono">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800/80 pt-2">
                <span>Total Payable</span>
                <span className="text-rose-400 font-mono text-base">₹{totalAmount}</span>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="button"
            disabled={selectedSeats.length === 0 || isBooking}
            onClick={handleConfirmBooking}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-sm font-bold text-white shadow-lg hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isBooking ? (
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Reservation (₹{totalAmount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
