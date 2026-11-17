/**
 * TMDB (The Movie Database) Live Synchronization Script
 * 
 * TMDB is 100% FREE for non-commercial & developer use.
 * Get a free API Key in 2 minutes at: https://www.themoviedb.org/settings/api
 * 
 * Usage:
 *   1. Add your key to backend/.env:
 *      TMDB_API_KEY=your_api_key_here
 *   2. Run:
 *      pnpm run sync:tmdb
 */

import { prisma } from "../src/configs/db.js";
import dotenv from "dotenv";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

async function fetchNowPlayingMovies() {
  if (!TMDB_API_KEY) {
    console.error("\n❌ Error: TMDB_API_KEY is missing in backend/.env!");
    console.log("👉 How to get a FREE API Key:");
    console.log("   1. Sign up for free at https://www.themoviedb.org/signup");
    console.log("   2. Go to Settings -> API -> Request an API Key");
    console.log("   3. Add `TMDB_API_KEY=your_key` to backend/.env");
    console.log("   4. Run `pnpm run sync:tmdb` again!\n");
    process.exit(1);
  }

  console.log("Fetching live 'Now Playing' cinema movies from TMDB API...");
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1&region=IN`
  );

  if (!res.ok) {
    throw new Error(`TMDB API request failed with status: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.results || [];
}

async function syncTMDB() {
  console.log("==================================================");
  console.log("   TMDB LIVE MOVIE SYNCHRONIZATION                ");
  console.log("==================================================\n");

  const venues = await prisma.venue.findMany();
  if (venues.length === 0) {
    console.log("⚠️ No venues found. Please run `pnpm run seed` first to seed the 15 cities and theatres.");
    process.exit(1);
  }

  const movies = await fetchNowPlayingMovies();
  console.log(`✓ Retrieved ${movies.length} live movies currently screening in theatres.\n`);

  let count = 0;
  for (const movie of movies) {
    if (!movie.poster_path) continue;

    const posterUrl = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
    const rating = movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : 7.5;

    // Distribute across a few venues
    const targetVenues = [
      venues[count % venues.length],
      venues[(count + 3) % venues.length],
      venues[(count + 7) % venues.length]
    ];

    for (const v of targetVenues) {
      // Check if event already exists for this title and venue
      const existing = await prisma.event.findFirst({
        where: {
          title: movie.title,
          venueId: v.id
        }
      });

      if (!existing) {
        await prisma.event.create({
          data: {
            title: movie.title,
            description: movie.overview || "Now playing in cinemas near you.",
            releaseDate: movie.release_date ? new Date(movie.release_date) : new Date(),
            poster: posterUrl,
            rating: rating,
            venueId: v.id
          }
        });
      }
    }

    count++;
    console.log(`[SYNCED] ${movie.title} (Rating: ${rating}/10) -> Distributed to venues`);
  }

  console.log("\n==================================================");
  console.log(`🎉 TMDB Sync Complete! Successfully synced ${count} movies.`);
  console.log("==================================================\n");
}

syncTMDB()
  .catch((e) => {
    console.error("TMDB Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
