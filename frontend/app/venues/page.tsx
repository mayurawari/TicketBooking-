"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { Building2, MapPin, Tv, Users, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VenuesPage() {
  const { isAuthenticated } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ message: string; venues: Venue[] }>("/api/venue/getvenues");
      setVenues(data.venues || []);
    } catch (err: any) {
      setError(
        err?.status === 401
          ? "Please sign in to view cinemas and venues."
          : (err?.message || "Failed to load venues")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [isAuthenticated]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-amber-500" />
            <span>Cinemas & Venues</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse premium theatres, multiplexes, and auditoriums hosting the latest events
          </p>
        </div>
        <button
          onClick={fetchVenues}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Notice</h3>
            <p className="text-sm text-zinc-400 max-w-md">{error}</p>
          </div>
          {!isAuthenticated && (
            <Link
              href="/login?returnUrl=/venues"
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Sign In to View Venues
            </Link>
          )}
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-16 text-center space-y-3">
          <Building2 className="h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-200">No venues found</h3>
          <p className="text-sm text-zinc-500">No cinema venues have been listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="flex flex-col justify-between rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 hover:border-zinc-700 transition-all shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-amber-600/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                    {venue.type}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">ID #{venue.id}</span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">{venue.name}</h3>

                <p className="flex items-start gap-1.5 text-xs text-zinc-400">
                  <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{venue.address}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="rounded-xl bg-zinc-950 p-2.5 flex items-center gap-2 text-zinc-300">
                    <Tv className="h-4 w-4 text-zinc-500" />
                    <span>{venue.totalScreens} Screens</span>
                  </div>
                  <div className="rounded-xl bg-zinc-950 p-2.5 flex items-center gap-2 text-zinc-300">
                    <Users className="h-4 w-4 text-zinc-500" />
                    <span>{venue.totalSeats} Total Seats</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/events?city=${encodeURIComponent(venue.city)}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white py-2.5 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>View Movies in {venue.city}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
