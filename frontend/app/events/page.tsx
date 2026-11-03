"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Event } from "@/lib/types";
import { api } from "@/lib/api";
import EventCard from "@/components/events/EventCard";
import { Film, Search, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function EventsContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "All";
  const initialTitle = searchParams.get("title") || "";

  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialTitle);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ message: string; allevents: Event[] }>("/api/event/getevents");
      setEvents(data.allevents || []);
    } catch (err: any) {
      setError(
        err?.status === 401
          ? "Authentication required. Please sign in to explore movies."
          : (err?.message || "Failed to load events")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAuthenticated]);

  const cities = useMemo(() => {
    const list = new Set<string>();
    events.forEach((e) => {
      if (e.venue?.city) list.add(e.venue.city);
    });
    return ["All", ...Array.from(list)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCity =
        selectedCity === "All" || (e.venue && e.venue.city.toLowerCase() === selectedCity.toLowerCase());
      return matchesSearch && matchesCity;
    });
  }, [events, searchQuery, selectedCity]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Film className="h-7 w-7 text-rose-500" />
            <span>Movies & Events</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse all upcoming movie screenings, multiplex schedules, and live shows
          </p>
        </div>
        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by movie title..."
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCity === city
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Notice</h3>
            <p className="text-sm text-zinc-400 max-w-md">{error}</p>
          </div>
          {!isAuthenticated && (
            <Link
              href="/login?returnUrl=/events"
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
            >
              Sign In to Continue
            </Link>
          )}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-16 text-center space-y-3">
          <Film className="h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-200">No events found</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            We couldn&apos;t find any events matching your criteria. Try changing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading events...</div>}>
      <EventsContent />
    </Suspense>
  );
}
