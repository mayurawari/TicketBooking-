"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event, Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string>("05:30 PM");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const eventRes = await api.get<{ message: string; getevent: Event }>(
          `/api/event/oneevent/${eventId}`
        );
        const eventData = eventRes.getevent;
        setEvent(eventData);

        if (eventData?.venueId) {
          try {
            const venueRes = await api.get<{ message: string; venue: Venue }>(
              `/api/venue/getvenue/${eventData.venueId}`
            );
            setVenue(venueRes.venue);
          } catch {
            // Venue fetch optional
          }
        }
      } catch (err: any) {
        setError(err?.message || "Could not load movie information.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-80 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3">
        <h2 className="text-lg font-bold text-white">Movie Unavailable</h2>
        <p className="text-xs text-zinc-400">{error || "Could not load movie information"}</p>
        <Link
          href="/events"
          className="inline-block rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  const formattedDate = event.releaseDate
    ? new Date(event.releaseDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Now Playing";

  const SHOWTIMES = [
    { time: "10:15 AM", format: "Dolby Atmos 4K", status: "Available" },
    { time: "01:45 PM", format: "IMAX Laser 2D", status: "Filling Fast" },
    { time: "05:30 PM", format: "4DX 3D Experience", status: "Available" },
    { time: "09:15 PM", format: "Dolby Atmos 4K", status: "Available" }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/events"
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Movies
        </Link>
      </div>

      {/* Main Movie Container */}
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column */}
          <div className="md:col-span-4">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800">
              {event.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.poster}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-700 text-xs font-semibold uppercase">
                  No Poster Available
                </div>
              )}

              {event.rating && (
                <div className="absolute top-2.5 right-2.5 rounded-md bg-zinc-950/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-400/20">
                  {event.rating.toFixed(1)} / 10
                </div>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                  Feature
                </span>
                {venue?.type && (
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                    {venue.type}
                  </span>
                )}
                <span className="rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold">
                  UA 16+
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span>{formattedDate}</span>
                {venue && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <span className="text-zinc-300">{venue.name}, {venue.city}</span>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                About the Movie
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {event.description ||
                  "Experience high-fidelity audio and crystal-clear visual projection on premium auditorium screens."}
              </p>
            </div>

            {/* Showtime Selection */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Select Showtime
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SHOWTIMES.map((st) => {
                  const isSelected = selectedShowtime === st.time;
                  return (
                    <button
                      key={st.time}
                      onClick={() => setSelectedShowtime(st.time)}
                      className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                        isSelected
                          ? "border-rose-500 bg-rose-600/15 text-white font-semibold"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-300"
                      }`}
                    >
                      <span className="block text-xs font-bold">{st.time}</span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">{st.format}</span>
                      <span className="block text-[9px] text-emerald-400 mt-1">{st.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venue & Booking Box */}
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 space-y-3">
              {venue && (
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{venue.name}</span>
                    <span className="text-zinc-500 text-[11px] block">{venue.address}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {venue.totalScreens} Screens
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Select your preferred seating tier (Luxury, Platinum, Gold, Silver)
                </span>

                <Link
                  href={`/events/${event.id}/book`}
                  className="rounded-lg bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-semibold text-white text-center transition-colors"
                >
                  Choose Seats ({selectedShowtime})
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
