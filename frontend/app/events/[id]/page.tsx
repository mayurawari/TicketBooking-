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
        setError(
          err?.status === 401
            ? "Authentication required. Please sign in to view movie details."
            : (err?.message || "Event not found")
        );
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
        <h2 className="text-xl font-bold text-white">Notice</h2>
        <p className="text-sm text-zinc-400">{error || "Could not load movie information"}</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/events"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Back to Events
          </Link>
          {!isAuthenticated && (
            <Link
              href={`/login?returnUrl=/events/${eventId}`}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              Sign In
            </Link>
          )}
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
    : "Currently Showing";

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
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
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
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {event.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span>{formattedDate}</span>
                </div>
                {venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span className="text-zinc-300">{venue.city}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  About the Movie
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {event.description ||
                    "Join audiences for an unforgettable big-screen cinematic journey with immersive audio and visual clarity."}
                </p>
              </div>
            </div>

            {/* Venue & Booking CTA Box */}
            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 space-y-4">
              {venue && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-400" />
                      <span className="font-semibold text-white text-sm">{venue.name}</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {venue.totalScreens} Screen{venue.totalScreens > 1 ? "s" : ""}
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
                  <span className="text-emerald-400 font-medium">● Seats Available</span> • Choose your row & tier
                </div>

                <Link
                  href={`/events/${event.id}/book`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/40 hover:from-rose-500 hover:to-amber-500 transition-all cursor-pointer"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Select Seats & Book</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
