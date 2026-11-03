"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Event } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/events/EventCard";
import { Film, Search, MapPin, Sparkles, Ticket, Shield, RefreshCw } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("All");

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ message: string; allevents: Event[] }>("/api/event/getevents");
      setEvents(data.allevents || []);
    } catch (err: any) {
      setError(
        err?.status === 401
          ? "Please sign in to browse and book the latest movies."
          : (err?.message || "Failed to load events. Ensure backend is running.")
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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-950/30 via-zinc-950 to-zinc-950 py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 border border-rose-500/20 px-4 py-1.5 text-xs font-semibold text-rose-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Cinema & Multiplex Booking</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Reserve the Best Seats for Your Favorite{" "}
            <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              Blockbusters
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-400">
            Select high-definition tiered cinema seats in real-time. Transparent pricing, instant ticket confirmation, and zero hassle.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-950/40 hover:opacity-90 transition-all"
                >
                  Sign In to Book Seats
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-zinc-900 border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-all"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">
                  Welcome back, <strong className="text-white">{user?.name || user?.email}</strong>!
                </span>
                <Link
                  href="/my-bookings"
                  className="rounded-xl bg-zinc-900 border border-rose-500/30 px-5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-zinc-800 transition-all"
                >
                  View My Tickets
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies by title..."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* City Selector */}
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
                      : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Film className="h-6 w-6 text-rose-500" />
              <span>Now Showing</span>
            </h2>
            <p className="text-xs text-zinc-400">Current cinema movies and featured events</p>
          </div>
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-400 border border-rose-500/20">
              <Ticket className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Access Notice</h3>
              <p className="text-sm text-zinc-400 max-w-md">{error}</p>
            </div>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
              >
                Sign In With Demo Account
              </Link>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-3">
            <Film className="h-10 w-10 text-zinc-600" />
            <h3 className="text-base font-semibold text-zinc-200">No events found</h3>
            <p className="text-xs text-zinc-500">
              Try adjusting your search query or switching to another city.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Ticket className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-white">Tiered Seat Visualizer</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose from Luxury, Platinum, Gold, Silver, and Front row seating with accurate color-coded seat tiers.
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-white">Conflict-Free Bookings</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time seat reservation engine guarantees no double booking and ensures your seat is locked immediately.
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-white">Instant Ticket Pass</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              View your active and past tickets anytime under My Bookings, with easy self-service ticket cancellation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
