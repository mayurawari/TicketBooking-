import React from "react";
import Link from "next/link";
import { Event } from "@/lib/types";
import { Star, MapPin, Calendar, Film, Sparkles } from "lucide-react";

export default function EventCard({ event }: { event: Event }) {
  const formattedDate = event.releaseDate
    ? new Date(event.releaseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/30 hover:-translate-y-1">
      {/* 2:3 Movie Poster Container (BookMyShow standard) */}
      <Link href={`/events/${event.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 block">
        {event.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-zinc-900 to-zinc-800 text-zinc-600">
            <Film className="h-14 w-14" />
          </div>
        )}

        {/* Dark Gradient Overlay at Bottom of Poster */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />

        {/* Rating Badge */}
        {event.rating !== null && event.rating !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-400/20 shadow-md">
            <Star className="h-3 w-3 fill-amber-400" />
            <span>{event.rating.toFixed(1)}/10</span>
          </div>
        )}

        {/* Screen/Experience Format Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-rose-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
          {event.venue?.type === "MULTIPLEX" ? "IMAX • 2D" : "DOLBY 4K"}
        </div>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <Link href={`/events/${event.id}`}>
            <h3 className="font-bold text-base text-white group-hover:text-rose-400 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          {/* City & Venue Tag */}
          {event.venue && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </div>
          )}

          {/* Release Date */}
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Calendar className="h-3 w-3 text-zinc-600 flex-shrink-0" />
              <span>Released {formattedDate}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={`/events/${event.id}`}
          className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-amber-500 text-white py-2 text-xs font-semibold transition-all shadow-md shadow-rose-950/30"
        >
          Book Tickets
        </Link>
      </div>
    </div>
  );
}
