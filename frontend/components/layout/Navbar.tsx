"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCity } from "@/context/CityContext";
import {
  Ticket,
  Film,
  Building2,
  MapPin,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Flame
} from "lucide-react";

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
    { href: "/events", label: "Movies", icon: Film },
    { href: "/venues", label: "Cinemas & Theatres", icon: Building2 },
    ...(isAuthenticated ? [{ href: "/my-bookings", label: "My Passes", icon: Ticket }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin Portal", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md text-zinc-100">
      {/* Primary Header Row */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-all">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold tracking-tight text-xl text-white">TicketPass</span>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <span className="text-[10px] text-amber-400 -mt-1 tracking-wider uppercase font-semibold">
                Cinema Booking
              </span>
            </div>
          </Link>

          {/* City Selector Pill (BookMyShow Signature) */}
          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:border-rose-500/50 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-sm"
            title="Click to change city"
          >
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            <span className="max-w-[110px] truncate">{selectedCity}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 ml-0.5" />
          </button>
        </div>

        {/* Center: Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-4 relative"
        >
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Movies, Theatres, or Events..."
            className="w-full rounded-full bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
          />
        </form>

        {/* Right: Navigation & User Auth */}
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Button / Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 py-1 pl-2 pr-3 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 text-white font-bold text-xs shadow">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-200 max-w-[100px] truncate hidden sm:inline">
                  {user.name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1 text-xs z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Signed in as</p>
                    <p className="font-semibold text-white truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-md border border-rose-500/30">
                        Admin Access
                      </span>
                    )}
                  </div>
                  <Link
                    href="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <Ticket className="h-4 w-4 text-amber-400" />
                    <span>My Bookings & Passes</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-rose-400" />
                      <span>Admin Management</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-zinc-800/80 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-950/40 hover:opacity-95 transition-all"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Secondary BookMyShow Category Sub-bar */}
      <div className="hidden sm:block border-t border-zinc-800/40 bg-zinc-950/40 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-6 text-zinc-300 font-medium">
            <Link
              href="/events"
              className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
            >
              <span>Movies</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-md font-semibold">Now Showing</span>
            </Link>
            <Link
              href="/venues"
              className="hover:text-amber-400 transition-colors"
            >
              Theatres & IMAX
            </Link>
            <Link
              href="/events?rating=8"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Flame className="h-3 w-3 text-amber-500" />
              <span>Top Rated Blockbusters</span>
            </Link>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span>Showing cinema schedules for:</span>
            <button
              onClick={openCityModal}
              className="text-amber-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {selectedCity}
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3 md:hidden">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies & venues..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </form>

          {/* Mobile City Picker Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openCityModal();
            }}
            className="flex w-full items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-500" />
              <span>Location: <strong>{selectedCity}</strong></span>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>

          <div className="pt-2 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-rose-500" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
