import React from "react";
import Link from "next/link";
import { Event } from "@/lib/types";

export default function EventCard({ event }: { event: Event }) {
  const formattedDate = event.releaseDate
    ? new Date(event.releaseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg">
      {/* 2:3 Movie Poster */}
      <Link href={`/events/${event.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 block">
        {event.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600 text-xs font-semibold uppercase tracking-wider">
            No Poster
          </div>
        )}

        {/* Rating Badge */}
        {event.rating !== null && event.rating !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 rounded-md bg-zinc-950/90 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-400/20">
            {event.rating.toFixed(1)} / 10
          </div>
        )}

        {/* Format Badge */}
        <div className="absolute top-2.5 right-2.5 rounded-md bg-zinc-950/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-800">
          {event.venue?.type === "MULTIPLEX" ? "IMAX 2D" : "4K DOLBY"}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
        <div className="space-y-1">
          <Link href={`/events/${event.id}`}>
            <h3 className="font-semibold text-sm text-white group-hover:text-rose-400 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          {/* Venue & City */}
          {event.venue && (
            <p className="text-xs text-zinc-400 truncate">
              {event.venue.name}, {event.venue.city}
            </p>
          )}

          {/* Release Date */}
          {formattedDate && (
            <p className="text-[11px] text-zinc-500">
              Released {formattedDate}
            </p>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/events/${event.id}`}
          className="w-full flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-200 hover:text-white py-2 text-xs font-semibold transition-colors"
        >
          Book Tickets
        </Link>
      </div>
    </div>
  );
}
