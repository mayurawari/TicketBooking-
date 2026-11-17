"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Event, Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCity } from "@/context/CityContext";
import EventCard from "@/components/events/EventCard";
import { Search } from "lucide-react";

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

  // Top Rated Featured Movie
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
    <div className="space-y-12 pb-16">
      {/* 1. Spotlight Feature Banner */}
      {spotlightMovie && (
        <section className="border-b border-zinc-800/80 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 lg:p-10 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Movie Specs */}
                <div className="md:col-span-8 space-y-4">
                  <div className="inline-block rounded-md bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Spotlight in {selectedCity}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {spotlightMovie.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    {spotlightMovie.rating && (
                      <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-bold text-amber-400">
                        {spotlightMovie.rating.toFixed(1)} / 10
                      </span>
                    )}
                    <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-zinc-300 font-medium">
                      IMAX 2D | 4K Dolby Atmos
                    </span>
                    {spotlightMovie.venue && (
                      <span className="text-zinc-400">
                        {spotlightMovie.venue.name}, {spotlightMovie.venue.city}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 max-w-2xl leading-relaxed">
                    {spotlightMovie.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/events/${spotlightMovie.id}`}
                      className="rounded-lg bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-semibold text-white transition-colors"
                    >
                      Book Tickets
                    </Link>
                    <button
                      onClick={openCityModal}
                      className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Change Region
                    </button>
                  </div>
                </div>

                {/* Poster Preview */}
                <div className="hidden md:flex md:col-span-4 justify-end">
                  <div className="relative aspect-[2/3] w-48 rounded-xl overflow-hidden shadow-xl border border-zinc-700/60 bg-zinc-950">
                    {spotlightMovie.poster && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={spotlightMovie.poster}
                        alt={spotlightMovie.title}
                        className="h-full w-full object-cover"
                      />
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Now Showing in {selectedCity}
              </h2>
              <button
                onClick={openCityModal}
                className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                (Change)
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a movie to view schedules, venues, and reserve seats
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-rose-600 text-white font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              All Movies
            </button>
            <button
              onClick={() => setActiveFilter("TOP_RATED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "TOP_RATED"
                  ? "bg-amber-500 text-zinc-950 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Top Rated (8.0+)
            </button>
            <button
              onClick={() => setActiveFilter("MULTIPLEX")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === "MULTIPLEX"
                  ? "bg-rose-600 text-white font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Multiplex / IMAX
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter titles in ${selectedCity}...`}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-10 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Movie Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 text-center space-y-3">
            <p className="text-xs text-zinc-400">{error}</p>
            <button
              onClick={fetchData}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-2">
            <h3 className="text-sm font-semibold text-white">No Screenings Available</h3>
            <p className="text-xs text-zinc-400">
              No shows match this filter in {selectedCity}.
            </p>
            <button
              onClick={() => setSelectedCity("All Cities")}
              className="mt-2 rounded-lg bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              Show All Cities
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

      {/* 3. Theatres in City */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5 pt-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Cinemas & Multiplexes in {selectedCity}
            </h2>
            <p className="text-xs text-zinc-400">
              Major venues with certified sound and projection
            </p>
          </div>
          <Link
            href="/venues"
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            All Venues
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {venues.slice(0, 3).map((venue) => (
            <div
              key={venue.id}
              className="flex flex-col justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-semibold uppercase text-amber-400">{venue.type}</span>
                  <span>{venue.city}</span>
                </div>
                <h3 className="font-semibold text-sm text-white">{venue.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{venue.address}</p>
                <div className="text-[11px] text-zinc-500 pt-1">
                  {venue.totalScreens} Screens | Tiered Seating
                </div>
              </div>

              <Link
                href={`/events?city=${encodeURIComponent(venue.city)}`}
                className="w-full text-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 text-xs font-medium transition-colors"
              >
                View Screenings
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Booking System Specs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1 border-l-2 border-rose-500 pl-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Zero Double Booking
              </h3>
              <p className="text-xs text-zinc-400">
                PostgreSQL partial unique indexing and atomic multi-seat transactions ensure concurrency safety.
              </p>
            </div>

            <div className="space-y-1 border-l-2 border-amber-500 pl-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Consolidated Passes
              </h3>
              <p className="text-xs text-zinc-400">
                All seats in an order are unified under a single reference card with split entry support.
              </p>
            </div>

            <div className="space-y-1 border-l-2 border-rose-500 pl-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Public Shareable Link
              </h3>
              <p className="text-xs text-zinc-400">
                Friends can open and view digital M-Ticket passes instantly without creating accounts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
