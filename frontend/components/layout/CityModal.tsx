"use client";

import React, { useState } from "react";
import { useCity, POPULAR_CITIES } from "@/context/CityContext";
import { Search, X } from "lucide-react";

export default function CityModal() {
  const { selectedCity, setSelectedCity, isCityModalOpen, closeCityModal } = useCity();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isCityModalOpen) return null;

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeCityModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5 text-zinc-100 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Select City</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Choose your region to view cinema showtimes and venues
            </p>
          </div>
          <button
            onClick={closeCityModal}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city (e.g. Mumbai, Bengaluru, Delhi-NCR)..."
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Popular Cities Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Major Regions
            </span>
            <button
              onClick={() => setSelectedCity("All Cities")}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCity === "All Cities"
                  ? "bg-rose-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              All Cities
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`p-2.5 rounded-lg text-center text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-rose-600/10 border-rose-500 text-rose-400 font-semibold"
                      : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span className="truncate block">{city}</span>
                </button>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-xs">
              No cities found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Active selection: <strong className="text-amber-400 font-semibold">{selectedCity}</strong></span>
          <span>15 Regional Hubs</span>
        </div>
      </div>
    </div>
  );
}
