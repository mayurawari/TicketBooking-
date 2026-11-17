"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event, Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Film,
  Star,
  MapPin,
  Calendar,
  Building2,
  Ticket,
  ArrowLeft,
  Tv,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Share2
} from "lucide-react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string>("05:30 PM (4DX 3D)");

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
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-96 rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-500 border border-rose-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Movie Unavailable</h2>
        <p className="text-sm text-zinc-400">{error || "Could not load movie information"}</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/events"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Back to Movies
          </Link>
        </div>
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Movies</span>
      </Link>

      {/* Main Movie Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column (2:3 aspect ratio) */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
              {event.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.poster}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-700">
                  <Film className="h-16 w-16" />
                </div>
              )}

              {event.rating && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md px-3 py-1 text-sm font-bold text-amber-400 border border-amber-400/20 shadow">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{event.rating.toFixed(1)} / 10</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-rose-600/10 border border-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-400">
                    Cinema Feature
                  </span>
                  {venue?.type && (
                    <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {venue.type}
                    </span>
                  )}
                  <span className="rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold">
                    UA 16+
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {event.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span>{formattedDate}</span>
                </div>
                {venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span className="text-zinc-300">{venue.name} • {venue.city}</span>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  About the Movie
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {event.description ||
                    "Join audiences for an unforgettable big-screen cinematic journey with immersive audio and visual clarity."}
                </p>
              </div>

              {/* Showtimes Selector (BookMyShow Signature) */}
              <div className="pt-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Select Showtime & Experience</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SHOWTIMES.map((st) => {
                    const isSelected = selectedShowtime.startsWith(st.time);
                    return (
                      <button
                        key={st.time}
                        onClick={() => setSelectedShowtime(`${st.time} (${st.format})`)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-rose-500 bg-rose-600/20 text-white shadow-md shadow-rose-950/20"
                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-300"
                        }`}
                      >
                        <span className="font-extrabold text-sm">{st.time}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{st.format}</span>
                        <span className="text-[9px] text-emerald-400 font-medium mt-1">
                          ● {st.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Venue & Booking CTA Box */}
            <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-5 space-y-4">
              {venue && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-400" />
                      <span className="font-semibold text-white text-sm">{venue.name}</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {venue.totalScreens} Screens Available
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>{venue.address}</span>
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="text-xs text-zinc-400">
                  <span className="text-emerald-400 font-semibold">● Live Seating Map</span> • Choose Luxury, Platinum, Gold, or Silver
                </div>

                <Link
                  href={`/events/${event.id}/book`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-amber-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Choose Seats ({selectedShowtime.split(" ")[0]})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
