"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { api } from "@/lib/api";
import { useCity } from "@/context/CityContext";
import { Search } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Cinemas in {selectedCity}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Multiplex and single-screen auditoriums
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCityModal}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            Change City ({selectedCity})
          </button>
          <button
            onClick={fetchVenues}
            disabled={isLoading}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cinemas by name or location..."
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedType("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedType === "ALL"
                ? "bg-amber-500 text-zinc-950 font-semibold"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            All Venues
          </button>
          <button
            onClick={() => setSelectedType("MULTIPLEX")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedType === "MULTIPLEX"
                ? "bg-amber-500 text-zinc-950 font-semibold"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Multiplex
          </button>
          <button
            onClick={() => setSelectedType("THEATRE")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedType === "THEATRE"
                ? "bg-amber-500 text-zinc-950 font-semibold"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Single Screen
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 text-center space-y-2">
          <p className="text-xs text-zinc-400">{error}</p>
          <button
            onClick={fetchVenues}
            className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-2">
          <h3 className="text-sm font-semibold text-zinc-200">No Cinemas Found</h3>
          <p className="text-xs text-zinc-400">
            No venues found matching your criteria in {selectedCity}.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("All Cities");
            }}
            className="mt-1 rounded-lg bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            Show All Cities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="flex flex-col justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {venue.type}
                  </span>
                  <span className="text-zinc-500 text-[11px]">{venue.city}</span>
                </div>

                <h3 className="font-semibold text-base text-white">
                  {venue.name}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2">
                  {venue.address}
                </p>

                {/* Specs */}
                <div className="flex items-center gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>{venue.totalScreens} Screens</span>
                  <span className="text-zinc-600">|</span>
                  <span>Dolby Atmos 4K</span>
                </div>
              </div>

              <Link
                href={`/events?city=${encodeURIComponent(venue.city)}`}
                className="w-full text-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white py-2 text-xs font-semibold transition-colors"
              >
                View Screenings
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
