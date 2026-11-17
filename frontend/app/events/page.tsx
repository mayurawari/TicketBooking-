"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Event } from "@/lib/types";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import EventCard from "@/components/events/EventCard";
import { Search } from "lucide-react";
import Link from "next/link";

function EventsContent() {
  const searchParams = useSearchParams();
  const urlCity = searchParams.get("city");
  const urlTitle = searchParams.get("title") || "";
  const minRatingParam = searchParams.get("rating");

  const { selectedCity, setSelectedCity, openCityModal } = useCity();

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Movies in {activeCity === "All" ? "All Cities" : activeCity}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Explore screenings, cinema auditoriums, and reserve seats
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCityModal}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            Change City ({activeCity})
          </button>
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie title or cast..."
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
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
            IMAX / Multiplex
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 text-center space-y-2">
          <p className="text-xs text-zinc-400">{error}</p>
          <button
            onClick={fetchEvents}
            className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">No Movies Found</h3>
          <p className="text-xs text-zinc-400">
            {searchQuery
              ? `No movies match "${searchQuery}" in ${activeCity}.`
              : `No titles found for this filter in ${activeCity}.`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("ALL");
              setSelectedCity("All Cities");
            }}
            className="mt-1 rounded-lg bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
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
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
