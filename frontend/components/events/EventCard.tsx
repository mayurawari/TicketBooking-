import React from "react";
import Link from "next/link";
import { Event } from "@/lib/types";
import { Star, MapPin, Calendar, Film } from "lucide-react";

export default function EventCard({ event }: { event: Event }) {
  const formattedDate = event.releaseDate
    ? new Date(event.releaseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20">
      {/* Poster / Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        {event.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-zinc-900 to-zinc-800 text-zinc-600">
            <Film className="h-12 w-12" />
          </div>
        )}

        {/* Rating Badge */}
        {event.rating !== null && event.rating !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-400/20 shadow">
            <Star className="h-3 w-3 fill-amber-400" />
            <span>{event.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-white group-hover:text-rose-400 transition-colors line-clamp-1">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="pt-2 flex flex-col gap-1.5 text-xs text-zinc-400">
            {event.venue && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{event.venue.name} • {event.venue.city}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="w-full flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-rose-600 text-zinc-100 hover:text-white py-2.5 text-xs font-semibold transition-all shadow"
        >
          Book Tickets
        </Link>
      </div>
    </div>
  );
}
