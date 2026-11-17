"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { PublicTicketPass } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Ticket,
  Film,
  MapPin,
  Calendar,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  QrCode,
  Users,
} from "lucide-react";

export default function PublicTicketViewPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const resolvedParams = use(params);
  const bookingReference = resolvedParams.reference;

  const [ticketData, setTicketData] = useState<PublicTicketPass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<PublicTicketPass>(
          `/api/booking/public/${bookingReference}`
        );
        setTicketData(data);
      } catch (err: any) {
        setError(err?.message || "Ticket pass not found or reference is invalid.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTicket();
  }, [bookingReference]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share && ticketData) {
      navigator.share({
        title: `${ticketData.event.title} - Digital Ticket Pass`,
        text: `Here are our cinema tickets for ${ticketData.event.title} (${ticketData.seats.length} tickets, Seats: ${ticketData.seats.map((s) => `${s.row}${s.seatNumber}`).join(", ")}):`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-400">Loading your cinema digital pass...</p>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-sm text-zinc-400 max-w-sm">{error || "Could not retrieve this ticket pass."}</p>
        <Link
          href="/"
          className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const { event, seats, totalAmount, status } = ticketData;
  const isCancelled = status === "CANCELLED";
  const seatLabels = seats.map((s) => `${s.row}${s.seatNumber}`).join(", ");
  const showDate = event.releaseDate
    ? new Date(event.releaseDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Today's Feature";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>My Tickets</span>
        </Link>

        {/* Action Buttons: Share & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Link Copied!" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share with Friends</span>
          </button>
        </div>
      </div>

      {/* Main BookMyShow Style Digital M-Ticket Card */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        {/* Top Ticket Header Banner */}
        <div className="bg-gradient-to-r from-rose-600/20 via-amber-600/10 to-rose-600/20 border-b border-zinc-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-xs shadow">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-rose-400">
                Official Digital M-Ticket
              </span>
              <p className="text-[11px] text-zinc-400 font-mono">Ref: {bookingReference}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isCancelled
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              ● {status}
            </span>
          </div>
        </div>

        {/* Movie Info & Cinema Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Poster Thumbnail */}
          <div className="md:col-span-3 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-md">
            {event.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.poster}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-600">
                <Film className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-9 space-y-4">
            <div>
              <span className="inline-block rounded-md bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-300 tracking-wider mb-2">
                {event.venue?.type || "MULTIPLEX"} • 2D / IMMERSIVE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">{event.venue?.name}</strong>
                  <span className="text-zinc-400 leading-relaxed">{event.venue?.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">{showDate}</strong>
                  <span className="text-zinc-400">Screen 1 • Standard Show</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Divider Line with Cutout Notches */}
        <div className="relative flex items-center py-2">
          {/* Left Notch */}
          <div className="absolute -left-4 h-8 w-8 rounded-full bg-zinc-950 border-r border-zinc-800" />
          {/* Dashed Line */}
          <div className="w-full border-t-2 border-dashed border-zinc-800/80 mx-6" />
          {/* Right Notch */}
          <div className="absolute -right-4 h-8 w-8 rounded-full bg-zinc-950 border-l border-zinc-800" />
        </div>

        {/* Seats Highlight, Amount & Master Barcode */}
        <div className="p-6 sm:p-8 bg-zinc-950/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              Reserved Seats ({seats.length} {seats.length === 1 ? "Ticket" : "Tickets"})
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {seatLabels}
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {seats.map((s) => (
                <span
                  key={s.id}
                  className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] uppercase font-mono text-zinc-300 font-bold"
                >
                  {s.row}{s.seatNumber} ({s.type})
                </span>
              ))}
            </div>
          </div>

          {/* Barcode & Price Callout */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="text-right">
              <span className="text-[10px] uppercase text-zinc-400 font-semibold">Total Amount</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                ₹{totalAmount}
              </div>
            </div>

            {/* Stylized Barcode Graphic */}
            <div className="bg-white p-2.5 rounded-xl flex flex-col items-center shadow-lg">
              <div className="h-10 w-44 flex items-center justify-between px-1 bg-black">
                {/* Visual Barcode stripes */}
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-full ${
                      i % 3 === 0
                        ? "w-1 bg-white"
                        : i % 2 === 0
                        ? "w-0.5 bg-white"
                        : "w-1.5 bg-white"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono font-bold text-black tracking-widest mt-1">
                {bookingReference}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Seats Admission Cards (For Friends Arriving Separately) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Individual Seat Passes (Split Entry)
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          Friends arriving at different times can show their individual seat badge below at the auditorium entrance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {seats.map((seat, idx) => (
            <div
              key={seat.id}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 relative overflow-hidden group hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  Seat #{idx + 1}
                </span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 border border-emerald-500/20">
                  {seat.isScanned ? "SCANNED" : "VALID"}
                </span>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {seat.row}{seat.seatNumber}
                </div>
                <span className="text-xs text-zinc-400">{seat.type} Tier • ₹{seat.price}</span>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Pass ID: #{seat.id}</span>
                <span className="text-amber-400 font-semibold">{bookingReference.slice(-4)}-{seat.row}{seat.seatNumber}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cinema Instructions */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-5 space-y-2 text-xs text-zinc-400 leading-relaxed">
        <h3 className="font-semibold text-white flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Cinema Admission Guidelines</span>
        </h3>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Please present this digital M-Ticket on your mobile screen at the cinema entrance.</li>
          <li>Physical printouts are not required; digital presentation is officially recognized.</li>
          <li>Outside food and beverages are strictly not permitted inside cinema halls.</li>
        </ul>
      </div>
    </div>
  );
}
