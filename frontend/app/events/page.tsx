"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Event } from "@/lib/types";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import EventCard from "@/components/events/EventCard";
import { Film, Search, MapPin, RefreshCw, AlertCircle, Star, Sparkles, Filter } from "lucide-react";
import Link from "next/link";

function EventsContent() {
  const searchParams = useSearchParams();
  const urlCity = searchParams.get("city");
  const urlTitle = searchParams.get("title") || "";
  const minRatingParam = searchParams.get("rating");

  const { selectedCity, setSelectedCity, openCityModal } = useCity();

  // If URL specified city, honor it
  const activeCity = urlCity || (selectedCity !== "All Cities" ? selectedCity : "All");

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlTitle);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TOP_RATED" | "MULTIPLEX">(
    minRatingParam ? "TOP_RATED" : "ALL"
  );

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint =
        activeCity && activeCity !== "All" && activeCity !== "All Cities"
          ? `/api/event/getevents?city=${encodeURIComponent(activeCity)}`
          : "/api/event/getevents";

      const data = await api.get<{ message: string; allevents: Event[] }>(endpoint);
      setEvents(data.allevents || []);
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
    fetchEvents();
  }, [activeCity]);

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Film className="h-7 w-7 text-rose-500" />
            <span>Now Showing in {activeCity === "All" ? "All Cities" : activeCity}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Browse movies, find your nearest cinema screen, and pick seats in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCityModal}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-rose-500/50 transition-colors cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            <span>Change City ({activeCity})</span>
          </button>
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies by title, cast, or keywords..."
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-rose-600 text-white shadow"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            All Movies
          </button>
          <button
            onClick={() => setActiveFilter("TOP_RATED")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeFilter === "TOP_RATED"
                ? "bg-amber-500 text-zinc-950 shadow"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>Top Rated (8.0+)</span>
          </button>
          <button
            onClick={() => setActiveFilter("MULTIPLEX")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "MULTIPLEX"
                ? "bg-rose-600 text-white shadow"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            IMAX / Multiplex
          </button>
        </div>
      </div>

      {/* Grid of Movies */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h3 className="text-lg font-semibold text-white">Notice</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">{error}</p>
          <button
            onClick={fetchEvents}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-rose-500"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-16 text-center space-y-3">
          <Film className="h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-200">No Movies Found</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">
            {searchQuery
              ? `No movies match "${searchQuery}" in ${activeCity}.`
              : `No movies are listed in ${activeCity} for the selected filter.`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("ALL");
              setSelectedCity("All Cities");
            }}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
          >
            Clear Filters & Show All Cities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="h-96 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
