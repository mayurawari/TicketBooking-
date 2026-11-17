"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import {
  Building2,
  MapPin,
  Tv,
  Users,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Search,
  Sparkles,
  Film
} from "lucide-react";

export default function VenuesPage() {
  const { selectedCity, setSelectedCity, openCityModal } = useCity();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "MULTIPLEX" | "THEATRE">("ALL");

  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint =
        selectedCity && selectedCity !== "All Cities"
          ? `/api/venue/getvenues?city=${encodeURIComponent(selectedCity)}`
          : "/api/venue/getvenues";

      const data = await api.get<{ message: string; venues: Venue[] }>(endpoint);
      setVenues(data.venues || []);
    } catch (err: any) {
      const rawMsg = String(err?.message || "");
      if (rawMsg.includes("<") || rawMsg.toLowerCase().includes("doctype")) {
        setError("Backend connection error. Please ensure the backend server is running on port 9090.");
      } else {
        setError(rawMsg || "Failed to load venues");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [selectedCity]);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "ALL" || v.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [venues, searchQuery, selectedType]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-amber-500" />
            <span>Cinemas & Multiplexes in {selectedCity}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Explore premier IMAX, 4DX, and luxury single-screen heritage theatres
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCityModal}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            <span>Change City ({selectedCity})</span>
          </button>
          <button
            onClick={fetchVenues}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cinemas by name, mall, or street..."
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedType("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "ALL"
                ? "bg-amber-500 text-zinc-950 font-bold shadow"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            All Venues
          </button>
          <button
            onClick={() => setSelectedType("MULTIPLEX")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "MULTIPLEX"
                ? "bg-amber-500 text-zinc-950 font-bold shadow"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Multiplexes
          </button>
          <button
            onClick={() => setSelectedType("THEATRE")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "THEATRE"
                ? "bg-amber-500 text-zinc-950 font-bold shadow"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Heritage Theatres
          </button>
        </div>
      </div>

      {/* Grid of Theatres */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <h3 className="text-lg font-semibold text-white">Notice</h3>
          <p className="text-sm text-zinc-400 max-w-md">{error}</p>
          <button
            onClick={fetchVenues}
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-amber-500"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-16 text-center space-y-3">
          <Building2 className="h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-200">No Cinemas Found</h3>
          <p className="text-sm text-zinc-500">
            No venues found matching your criteria in {selectedCity}.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("All Cities");
            }}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
          >
            Show Theatres in All Cities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="flex flex-col justify-between rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 hover:border-zinc-700 transition-all shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {venue.type}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <MapPin className="h-3 w-3 text-rose-500" />
                    <span>{venue.city}</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                  {venue.name}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {venue.address}
                </p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                    Dolby Atmos 4K
                  </span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                    Laser Projection
                  </span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                    Luxury Recliner
                  </span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-5 text-xs text-zinc-400 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Tv className="h-4 w-4 text-zinc-500" />
                    <span>{venue.totalScreens} Screens</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-zinc-500" />
                    <span>Tiered Seating Layout</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/events?city=${encodeURIComponent(venue.city)}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-gradient-to-r hover:from-rose-600 hover:to-amber-500 text-zinc-200 hover:text-white py-2.5 text-xs font-semibold transition-all shadow"
              >
                <span>View Screenings at this Cinema</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
