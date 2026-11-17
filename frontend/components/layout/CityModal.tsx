"use client";

import React, { useState } from "react";
import { useCity, POPULAR_CITIES } from "@/context/CityContext";
import { MapPin, Search, X, Check, Building2, Sparkles } from "lucide-react";

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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCityModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 text-zinc-100 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 shadow">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Select Your City</h2>
              <p className="text-xs text-zinc-400">
                Discover movie screenings and iconic multiplexes in your city
              </p>
            </div>
          </div>
          <button
            onClick={closeCityModal}
            className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your city (e.g. Mumbai, Bengaluru, Delhi-NCR)..."
            className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 pl-11 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
            autoFocus
          />
        </div>

        {/* Popular Cities Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Popular Metro Hubs</span>
            </span>
            <button
              onClick={() => setSelectedCity("All Cities")}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                selectedCity === "All Cities"
                  ? "bg-rose-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Show All Cities
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`flex items-center justify-between p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-rose-600/20 to-amber-500/10 border-rose-500/50 text-white shadow-md shadow-rose-950/20"
                      : "bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-medium truncate">{city}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No cities match &quot;{searchQuery}&quot;. Please try another search term.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Currently selected: <strong className="text-amber-400">{selectedCity}</strong></span>
          <span>15 Major Indian Metro Regions</span>
        </div>
      </div>
    </div>
  );
}
