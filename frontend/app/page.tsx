"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Event, Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCity } from "@/context/CityContext";
import EventCard from "@/components/events/EventCard";
import {
  Film,
  Search,
  MapPin,
  Sparkles,
  Ticket,
  Shield,
  RefreshCw,
  Building2,
  Star,
  Flame,
  ChevronRight,
  Share2,
  Tv
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { selectedCity, openCityModal, setSelectedCity } = useCity();

  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TOP_RATED" | "MULTIPLEX">("ALL");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, venuesData] = await Promise.all([
        api.get<{ message: string; allevents: Event[] }>(
          selectedCity && selectedCity !== "All Cities"
            ? `/api/event/getevents?city=${encodeURIComponent(selectedCity)}`
            : "/api/event/getevents"
        ),
        api.get<{ message: string; venues: Venue[] }>(
          selectedCity && selectedCity !== "All Cities"
            ? `/api/venue/getvenues?city=${encodeURIComponent(selectedCity)}`
            : "/api/venue/getvenues"
        )
      ]);

      setEvents(eventsData.allevents || []);
      setVenues(venuesData.venues || []);
    } catch (err: any) {
      const rawMsg = String(err?.message || "");
      if (rawMsg.includes("<") || rawMsg.toLowerCase().includes("doctype")) {
        setError("Backend connection error. Please ensure the backend server is running on port 9090.");
      } else {
        setError(rawMsg || "Failed to load events. Ensure backend is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  // Featured Spotlight Movie (Top Rated)
  const spotlightMovie = useMemo(() => {
    if (events.length === 0) return null;
    return [...events].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (activeFilter === "TOP_RATED") {
        matchesFilter = (e.rating || 0) >= 8.0;
      } else if (activeFilter === "MULTIPLEX") {
        matchesFilter = e.venue?.type === "MULTIPLEX";
      }

      return matchesSearch && matchesFilter;
    });
  }, [events, searchQuery, activeFilter]);

  return (
    <div className="space-y-12 pb-20">
      {/* 1. BookMyShow Featured Hero Spotlight Banner */}
      {spotlightMovie && (
        <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800/80">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl">
              {/* Backdrop glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-transparent pointer-events-none" />

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
                {/* Text Specs */}
                <div className="md:col-span-8 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-3.5 py-1 text-xs font-semibold text-rose-400">
                    <Flame className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                    <span>Trending Blockbuster in {selectedCity}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    {spotlightMovie.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {spotlightMovie.rating && (
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 font-bold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{spotlightMovie.rating.toFixed(1)} / 10 Rating</span>
                      </div>
                    )}
                    <div className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300 font-medium">
                      IMAX 2D • 4K Dolby Atmos
                    </div>
                    {spotlightMovie.venue && (
                      <div className="flex items-center gap-1 text-zinc-400">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>{spotlightMovie.venue.name}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-zinc-300 line-clamp-3 max-w-2xl leading-relaxed">
                    {spotlightMovie.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={`/events/${spotlightMovie.id}`}
                      className="rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-amber-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/40 hover:scale-105 transition-all"
                    >
                      Book Tickets Now
                    </Link>
                    <button
                      onClick={openCityModal}
                      className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      <span>Explore other cities</span>
                    </button>
                  </div>
                </div>

                {/* Poster Preview */}
                <div className="hidden md:flex md:col-span-4 justify-center">
                  <div className="relative aspect-[2/3] w-56 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 group-hover:scale-105 transition-transform">
                    {spotlightMovie.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={spotlightMovie.poster}
                        alt={spotlightMovie.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                        <Film className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Main Movies Grid with City Header & Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Recommended Movies in</span>
                <span className="bg-gradient-to-r from-rose-500 to-amber-400 bg-clip-text text-transparent">
                  {selectedCity}
                </span>
              </h2>
              <button
                onClick={openCityModal}
                className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                (Change)
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Select any movie to choose showtimes, screens, and reserve seats in real-time
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              All Releases
            </button>
            <button
              onClick={() => setActiveFilter("TOP_RATED")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                activeFilter === "TOP_RATED"
                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>Top Rated (8.0+)</span>
            </button>
            <button
              onClick={() => setActiveFilter("MULTIPLEX")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === "MULTIPLEX"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Multiplex & IMAX
            </button>
          </div>
        </div>

        {/* Search input in section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter movies in ${selectedCity}...`}
            className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>

        {/* Movie Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-10 text-center space-y-3">
            <p className="text-sm text-zinc-400">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-3">
            <Film className="h-10 w-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No movie screenings found</h3>
            <p className="text-xs text-zinc-400">
              No shows match your filter in <strong>{selectedCity}</strong>.
            </p>
            <button
              onClick={() => setSelectedCity("All Cities")}
              className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
            >
              View All Cities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Famous Multiplexes & Theatres in Selected City */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-amber-500" />
              <span>Popular Theatres & Cinemas in {selectedCity}</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Experience movies on world-class IMAX, 4DX, and Dolby Atmos screens
            </p>
          </div>
          <Link
            href="/venues"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All Theatres</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {venues.slice(0, 3).map((venue) => (
            <div
              key={venue.id}
              className="flex flex-col justify-between rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4 hover:border-zinc-700 transition-all shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {venue.type}
                  </span>
                  <span className="text-xs text-zinc-500">{venue.city}</span>
                </div>
                <h3 className="font-bold text-base text-white">{venue.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{venue.address}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1">
                    <Tv className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{venue.totalScreens} Screens</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Dolby 4K • Recliner</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/events?city=${encodeURIComponent(venue.city)}`}
                className="w-full flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 text-xs font-semibold transition-colors"
              >
                Browse Screenings Here
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BookMyShow Standards Guarantee Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl bg-gradient-to-r from-rose-950/30 via-zinc-900 to-amber-950/20 border border-zinc-800 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto md:mx-0">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Guaranteed Zero Double Booking</h3>
              <p className="text-xs text-zinc-400">
                Enforced by database-level partial unique indexing and atomic multi-seat transactions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto md:mx-0">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Instant Friend Link Sharing</h3>
              <p className="text-xs text-zinc-400">
                Share public M-Ticket passes directly on WhatsApp. Friends can view and scan passes without logging in.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto md:mx-0">
                <Ticket className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Consolidated Master Cards</h3>
              <p className="text-xs text-zinc-400">
                All seats in an order are grouped into a single unified pass card with individual gate split-entry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
