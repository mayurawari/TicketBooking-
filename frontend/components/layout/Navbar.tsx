"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCity } from "@/context/CityContext";
import { Search, ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, openCityModal } = useCity();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?title=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: "/events", label: "Movies" },
    { href: "/venues", label: "Cinemas" },
    ...(isAuthenticated ? [{ href: "/my-bookings", label: "My Bookings" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md text-zinc-100">
      {/* Primary Navigation Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand & City Selection */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="font-extrabold tracking-tight text-xl text-white">
              Ticket<span className="text-rose-500">Pass</span>
            </span>
          </Link>

          {/* Location Selector */}
          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            title="Change City"
          >
            <span className="text-zinc-500">City:</span>
            <span className="font-semibold text-zinc-100 max-w-[100px] truncate">{selectedCity}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400 ml-0.5" />
          </button>
        </div>

        {/* Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-2 relative"
        >
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, genres, or theatres..."
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
          />
        </form>

        {/* Navigation Links & User Authentication */}
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 py-1.5 px-3 hover:border-zinc-700 transition-colors cursor-pointer text-xs"
              >
                <span className="font-semibold text-zinc-200 max-w-[120px] truncate">
                  {user.name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl py-1 text-xs z-50 animate-in fade-in"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Account</p>
                    <p className="font-medium text-white truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider text-rose-400 font-bold">
                        Administrator
                      </span>
                    )}
                  </div>
                  <Link
                    href="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3.5 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    My Bookings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3.5 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-zinc-800 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Secondary Category Bar */}
      <div className="hidden sm:block border-t border-zinc-800/50 bg-zinc-950/60 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-6 text-zinc-400 font-medium">
            <Link href="/events" className="hover:text-white transition-colors">
              Now Showing
            </Link>
            <Link href="/venues" className="hover:text-white transition-colors">
              Cinemas & Screens
            </Link>
            <Link href="/events?rating=8" className="hover:text-white transition-colors">
              Top Rated (8.0+)
            </Link>
          </div>

          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <span>Region:</span>
            <button
              onClick={openCityModal}
              className="text-amber-400 font-medium hover:underline cursor-pointer"
            >
              {selectedCity}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-3 md:hidden">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies & venues..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </form>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openCityModal();
            }}
            className="flex w-full items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
          >
            <span>City: <strong className="text-white">{selectedCity}</strong></span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          <div className="pt-1 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
