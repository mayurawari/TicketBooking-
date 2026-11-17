import { prisma } from "../src/configs/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const CITIES = [
  "Mumbai",
  "Delhi-NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Goa",
  "Lucknow",
  "Indore",
  "Surat"
];

const FAMOUS_VENUES = [
  // 1. Mumbai
  {
    name: "PVR ICON Phoenix Palladium",
    address: "Level 3, High Street Phoenix, 462 Senapati Bapat Marg, Lower Parel",
    city: "Mumbai",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 7
  },
  {
    name: "INOX Megaplex Inorbit Mall",
    address: "Level 4, Inorbit Mall, New Link Rd, Malad West",
    city: "Mumbai",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 11
  },
  {
    name: "Cinépolis Nexus Seawoods",
    address: "Grand Central Mall, Sector 40, Seawoods Railway Station, Navi Mumbai",
    city: "Mumbai",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },

  // 2. Delhi-NCR
  {
    name: "PVR Director's Cut Ambience Mall",
    address: "Ambience Mall, Nelson Mandela Marg, Vasant Kunj",
    city: "Delhi-NCR",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  },
  {
    name: "PVR Plaza Heritage Cinema",
    address: "H-Block, Connaught Circus, Connaught Place",
    city: "Delhi-NCR",
    type: "THEATRE",
    totalSeats: 40,
    totalScreens: 1
  },
  {
    name: "INOX Insignia Epicuria",
    address: "Epicuria Food Mall, Nehru Place Metro Station",
    city: "Delhi-NCR",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 3
  },

  // 3. Bengaluru
  {
    name: "PVR Forum Mall Koramangala",
    address: "The Forum Mall, 21 Hosur Road, Koramangala",
    city: "Bengaluru",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 11
  },
  {
    name: "INOX Lido Mall MG Road",
    address: "1/4 Lido Mall, Swami Vivekananda Rd, Ulsoor",
    city: "Bengaluru",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  },
  {
    name: "Urvashi Cinema 4K Laser",
    address: "No. 40, Siddaiah Road, Lalbagh Road, Sudhama Nagar",
    city: "Bengaluru",
    type: "THEATRE",
    totalSeats: 40,
    totalScreens: 1
  },

  // 4. Hyderabad
  {
    name: "Prasads Multiplex & IMAX Screen",
    address: "NTR Gardens, Necklace Road, Khairatabad",
    city: "Hyderabad",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },
  {
    name: "AMB Cinemas Super Luxury",
    address: "Sarath City Capital Mall, Gachibowli - Miyapur Rd",
    city: "Hyderabad",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 7
  },
  {
    name: "PVR Next Galleria Mall",
    address: "Irrum Manzil, Punjagutta Colony",
    city: "Hyderabad",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 8
  },

  // 5. Chennai
  {
    name: "SPI Cinemas Sathyam",
    address: "8 Thiru Vi Ka Road, Royapettah",
    city: "Chennai",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },
  {
    name: "PVR Palazzo Nexus Vijaya Mall",
    address: "Vadapalani Metro Station, 100 Feet Rd",
    city: "Chennai",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 9
  },
  {
    name: "AGS Cinemas T. Nagar",
    address: "24 GN Chetty Rd, Satyamurthy Nagar, T. Nagar",
    city: "Chennai",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  },

  // 6. Pune
  {
    name: "Cinépolis Westend Mall",
    address: "Near Reliance Mart, Harmony Society, Ward No. 8, Aundh",
    city: "Pune",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 8
  },
  {
    name: "PVR Phoenix Marketcity",
    address: "S No 207, Viman Nagar Road",
    city: "Pune",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 9
  },
  {
    name: "City Pride Multiplex Kothrud",
    address: "Paschimanagari, Kothrud",
    city: "Pune",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 5
  },

  // 7. Kolkata
  {
    name: "INOX Quest Mall Ballygunge",
    address: "33 Syed Amir Ali Ave, Park Circus, Beck Bagan",
    city: "Kolkata",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },
  {
    name: "PVR Mani Square EM Bypass",
    address: "164/1 Maniktala Main Rd, Kadapara, Phool Bagan",
    city: "Kolkata",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  },
  {
    name: "Priya Cinema Heritage",
    address: "95 Rash Behari Ave, Triangular Park, Lake Market",
    city: "Kolkata",
    type: "THEATRE",
    totalSeats: 40,
    totalScreens: 1
  },

  // 8. Ahmedabad
  {
    name: "PVR Acropolis Mall Thaltej",
    address: "Thaltej Cross Road, Sarkhej - Gandhinagar Hwy",
    city: "Ahmedabad",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },
  {
    name: "Cinépolis Alpha One Mall Vastrapur",
    address: "Vastrapur Lake, Sarkhej - Gandhinagar Hwy",
    city: "Ahmedabad",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 7
  },

  // 9. Jaipur
  {
    name: "Raj Mandir Cinema (The Pride of Asia)",
    address: "Bhagwan Das Rd, Panch Batti, C Scheme, Ashok Nagar",
    city: "Jaipur",
    type: "THEATRE",
    totalSeats: 40,
    totalScreens: 1
  },
  {
    name: "INOX GT Central Malviya Nagar",
    address: "Gaurav Tower, Jawahar Lal Nehru Marg, D-Block",
    city: "Jaipur",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 8
  },

  // 10. Chandigarh
  {
    name: "PVR Elante Mall",
    address: "178-178A, Industrial Area Phase I",
    city: "Chandigarh",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 8
  },
  {
    name: "Cinépolis Jagat Mall Sector 17",
    address: "Sector 17C, Near Neelam Cinema",
    city: "Chandigarh",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 3
  },

  // 11. Kochi
  {
    name: "PVR LuLu International Shopping Mall",
    address: "34/1000, Old NH 47, Edappally Junction",
    city: "Kochi",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 9
  },
  {
    name: "Shenoys Theatre 4K Atmos",
    address: "Shenoys Junction, Mahatma Gandhi Rd",
    city: "Kochi",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 5
  },

  // 12. Goa
  {
    name: "INOX Panjim Maquinez Palace",
    address: "Old GMC Heritage Complex, Campal, Panaji",
    city: "Goa",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  },
  {
    name: "1955 Cinépolis Mall De Goa",
    address: "Mall De Goa, NH 66, Porvorim",
    city: "Goa",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 5
  },

  // 13. Lucknow
  {
    name: "PVR Phoenix Palassio",
    address: "Sector-7, Amar Shaheed Path, Gomti Nagar Extension",
    city: "Lucknow",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 10
  },
  {
    name: "INOX Riverside Mall",
    address: "Vipin Khand, Gomti Nagar",
    city: "Lucknow",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  },

  // 14. Indore
  {
    name: "PVR Treasure Island",
    address: "11, Tukoganj Main Rd, South Tukoganj",
    city: "Indore",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 5
  },
  {
    name: "INOX C21 Mall Vijay Nagar",
    address: "Plot No. 261, Scheme 54, PU 4, Commercial, AB Rd",
    city: "Indore",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },

  // 15. Surat
  {
    name: "VR Surat INOX Dumas Road",
    address: "Surat-Dumas Rd, Magdalla",
    city: "Surat",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 6
  },
  {
    name: "Rajhans Multiplex Pal",
    address: "Hazira Road, Pal Gam",
    city: "Surat",
    type: "MULTIPLEX",
    totalSeats: 40,
    totalScreens: 4
  }
];

const REAL_MOVIES = [
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
    releaseDate: "2024-03-01T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    rating: 8.6
  },
  {
    title: "Deadpool & Wolverine",
    description: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his home world faces an existential threat, Wade must reluctantly suit up with an even more reluctant Wolverine.",
    releaseDate: "2024-07-26T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    rating: 8.0
  },
  {
    title: "Kalki 2898 AD",
    description: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces in a dystopian post-apocalyptic future set in Kasi.",
    releaseDate: "2024-06-27T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/x7fXh7j9vK9H25uQ4J4Q4b3o0r5.jpg",
    rating: 7.9
  },
  {
    title: "Oppenheimer",
    description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II, examining the moral complexities, geopolitical conflicts, and personal toll of scientific discovery.",
    releaseDate: "2023-07-21T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    rating: 8.9
  },
  {
    title: "Interstellar (10th Anniversary IMAX Re-Release)",
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans through a mysterious wormhole near Saturn.",
    releaseDate: "2024-11-06T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 8.7
  },
  {
    title: "Stree 2: Sarkate Ka Aatank",
    description: "The town of Chanderi is haunted once again, this time by a headless entity abducting progressive women. Vicky and his loyal gang must unite with Stree and unravel ancient mysteries to save their town.",
    releaseDate: "2024-08-15T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/m6ZeqCqGf7dD7UoV5f3pUe8bZgQ.jpg",
    rating: 7.8
  },
  {
    title: "Gladiator II",
    description: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    releaseDate: "2024-11-15T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    rating: 7.7
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
    releaseDate: "2023-06-02T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    rating: 8.7
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    releaseDate: "2008-07-18T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 9.0
  },
  {
    title: "Jawan",
    description: "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society, with high-stakes heist sequences and gripping family revelation.",
    releaseDate: "2023-09-07T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/jNQfQj99R3wE8eXp8Xp3q8s5Q2L.jpg",
    rating: 7.5
  },
  {
    title: "Avatar: The Way of Water",
    description: "Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
    releaseDate: "2022-12-16T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    rating: 7.7
  },
  {
    title: "Pushpa 2: The Rule",
    description: "The clash between Pushpa Raj and Bhanwar Singh Shekhawat escalates into an all-out war as Pushpa expands his red sandalwood smuggling syndicate across international borders.",
    releaseDate: "2024-12-05T00:00:00.000Z",
    poster: "https://image.tmdb.org/t/p/w500/shqV1D6qfA6pM38E75C46Y6b72R.jpg",
    rating: 8.3
  }
];

function generateSeatsForVenue(venueId) {
  // 4 rows: A (LUXURY), B (PLATINUM), C (GOLD), D (SILVER), 10 seats each = 40 seats
  const rows = [
    { row: "A", type: "LUXURY", count: 10 },
    { row: "B", type: "PLATINUM", count: 10 },
    { row: "C", type: "GOLD", count: 10 },
    { row: "D", type: "SILVER", count: 10 }
  ];

  const seats = [];
  for (const { row, type, count } of rows) {
    for (let num = 1; num <= count; num++) {
      seats.push({
        seatNumber: `${row}${num}`,
        row,
        type,
        venueId
      });
    }
  }
  return seats;
}

async function seed() {
  console.log("=================================================");
  console.log("  SEEDING BOOKMYSHOW-STYLE REAL CINEMA DATABASE  ");
  console.log("=================================================\n");

  // 1. Clean existing data in order of foreign key constraints
  console.log("-> Clearing old records...");
  await prisma.booking.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.venue.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✓ Database cleared cleanly.\n");

  // 2. Seed Default Accounts
  console.log("-> Seeding Users...");
  const adminPassword = await bcrypt.hash("Admin@1234", 10);
  const userPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@ticketpass.com",
      password: adminPassword,
      name: "System Administrator",
      role: "ADMIN"
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "mayurawari50@gmail.com",
      password: userPassword,
      name: "Mayur Awari",
      role: "USER"
    }
  });

  const demoUser2 = await prisma.user.create({
    data: {
      email: "rahul.sharma@example.com",
      password: userPassword,
      name: "Rahul Sharma",
      role: "USER"
    }
  });

  console.log(`✓ Created 3 users:`);
  console.log(`   - Admin: ${admin.email} (Password: Admin@1234)`);
  console.log(`   - Demo User: ${demoUser.email} (Password: Password@123)`);
  console.log(`   - Demo User 2: ${demoUser2.email} (Password: Password@123)\n`);

  // 3. Seed Venues across 15 Cities
  console.log(`-> Seeding ${FAMOUS_VENUES.length} famous multiplexes across 15 metro cities...`);
  const createdVenues = [];
  for (const vData of FAMOUS_VENUES) {
    const venue = await prisma.venue.create({ data: vData });
    createdVenues.push(venue);
  }
  console.log(`✓ Successfully seeded ${createdVenues.length} multiplexes & theatres across 15 cities.\n`);

  // 4. Seed Seats for each Venue (40 seats each)
  console.log(`-> Seeding tiered seating layouts (LUXURY, PLATINUM, GOLD, SILVER) for all venues...`);
  let totalSeatsSeeded = 0;
  for (const venue of createdVenues) {
    const seatsData = generateSeatsForVenue(venue.id);
    await prisma.seat.createMany({ data: seatsData });
    totalSeatsSeeded += seatsData.length;
  }
  console.log(`✓ Seeded ${totalSeatsSeeded} seats (${createdVenues.length} venues x 40 seats each).\n`);

  // 5. Seed Real Blockbuster Movies across Venues
  console.log(`-> Seeding ${REAL_MOVIES.length} real blockbuster movies mapped across venues...`);
  let eventIndex = 0;
  let totalEventsSeeded = 0;

  // Distribute movies across the venues so every city has 2-4 blockbuster movies screening
  for (let i = 0; i < createdVenues.length; i++) {
    const venue = createdVenues[i];
    // Assign 2 to 3 movies per venue
    const moviesForVenue = [
      REAL_MOVIES[i % REAL_MOVIES.length],
      REAL_MOVIES[(i + 1) % REAL_MOVIES.length],
      REAL_MOVIES[(i + 4) % REAL_MOVIES.length]
    ];

    for (const movie of moviesForVenue) {
      await prisma.event.create({
        data: {
          title: movie.title,
          description: movie.description,
          releaseDate: new Date(movie.releaseDate),
          poster: movie.poster,
          rating: movie.rating,
          venueId: venue.id
        }
      });
      totalEventsSeeded++;
    }
  }

  console.log(`✓ Seeded ${totalEventsSeeded} movie screenings across all cities.\n`);

  // Summary
  console.log("=================================================");
  console.log("  SEEDING COMPLETE! SUMMARY:                     ");
  console.log("=================================================");
  console.log(`  Cities Covered:    15 Famous Metro Cities`);
  console.log(`  Theaters/Venues:   ${createdVenues.length}`);
  console.log(`  Screenings/Events: ${totalEventsSeeded}`);
  console.log(`  Tiered Seats:      ${totalSeatsSeeded}`);
  console.log(`  Registered Users:  3`);
  console.log("=================================================\n");
}

seed()
  .catch((e) => {
    console.error("Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
