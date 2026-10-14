import bcrypt from 'bcrypt';
import { prisma } from '../src/configs/db.js';

async function seedData() {
    console.log('--- Step 1: Seeding Users ---');
    
    // 1. Ensure Standard User
    const userPasswordHash = await bcrypt.hash('123456', 10);
    const regularUser = await prisma.user.upsert({
        where: { email: 'mayurawari50@gmail.com' },
        update: { password: userPasswordHash, role: 'USER', name: 'Mayur Awari' },
        create: {
            email: 'mayurawari50@gmail.com',
            password: userPasswordHash,
            role: 'USER',
            name: 'Mayur Awari'
        }
    });
    console.log('Regular User configured:', regularUser.email, regularUser.role);

    // 2. Ensure Admin User
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@ticketbooking.com' },
        update: { password: adminPasswordHash, role: 'ADMIN', name: 'Super Admin' },
        create: {
            email: 'admin@ticketbooking.com',
            password: adminPasswordHash,
            role: 'ADMIN',
            name: 'Super Admin'
        }
    });
    console.log('Admin User configured:', adminUser.email, adminUser.role);

    console.log('\n--- Step 2: Seeding Venues ---');
    const venueConfigs = [
        {
            name: 'Radhakrishna 3d theatre',
            city: 'Chandrapur',
            address: 'Near varoranaka, under varoranaka flyover, tukum, chandrapur, Maharashtra 442401',
            type: 'THEATRE',
            totalSeats: 300,
            totalScreens: 1,
            seatTiers: [
                { row: 'A', type: 'FRONT', count: 20 },
                { row: 'B', type: 'FRONT', count: 20 },
                { row: 'C', type: 'SILVER', count: 25 },
                { row: 'D', type: 'SILVER', count: 25 },
                { row: 'E', type: 'SILVER', count: 25 },
                { row: 'F', type: 'GOLD', count: 25 },
                { row: 'G', type: 'GOLD', count: 25 },
                { row: 'H', type: 'GOLD', count: 25 },
                { row: 'I', type: 'GOLD', count: 25 },
                { row: 'J', type: 'PLATINUM', count: 25 },
                { row: 'K', type: 'PLATINUM', count: 30 },
                { row: 'L', type: 'PLATINUM', count: 30 }
            ]
        },
        {
            name: 'PVR ICON: Phoenix Palladium',
            city: 'Mumbai',
            address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
            type: 'MULTIPLEX',
            totalSeats: 160,
            totalScreens: 5,
            seatTiers: [
                { row: 'A', type: 'LUXURY', count: 12 },
                { row: 'B', type: 'LUXURY', count: 12 },
                { row: 'C', type: 'PLATINUM', count: 18 },
                { row: 'D', type: 'PLATINUM', count: 18 },
                { row: 'E', type: 'GOLD', count: 25 },
                { row: 'F', type: 'GOLD', count: 25 },
                { row: 'G', type: 'GOLD', count: 25 },
                { row: 'H', type: 'SILVER', count: 25 }
            ]
        },
        {
            name: 'INOX Megaplex: Inorbit Mall',
            city: 'Mumbai',
            address: 'Link Road, Malad West, Mumbai, Maharashtra 400064',
            type: 'MULTIPLEX',
            totalSeats: 150,
            totalScreens: 4,
            seatTiers: [
                { row: 'A', type: 'LUXURY', count: 10 },
                { row: 'B', type: 'LUXURY', count: 10 },
                { row: 'C', type: 'PLATINUM', count: 20 },
                { row: 'D', type: 'PLATINUM', count: 20 },
                { row: 'E', type: 'GOLD', count: 25 },
                { row: 'F', type: 'GOLD', count: 25 },
                { row: 'G', type: 'SILVER', count: 20 },
                { row: 'H', type: 'SILVER', count: 20 }
            ]
        },
        {
            name: 'PVR Directors Cut: Ambience Mall',
            city: 'New Delhi',
            address: 'Nelson Mandela Marg, Vasant Kunj, New Delhi, Delhi 110070',
            type: 'MULTIPLEX',
            totalSeats: 100,
            totalScreens: 3,
            seatTiers: [
                { row: 'A', type: 'LUXURY', count: 15 },
                { row: 'B', type: 'LUXURY', count: 15 },
                { row: 'C', type: 'LUXURY', count: 15 },
                { row: 'D', type: 'PLATINUM', count: 25 },
                { row: 'E', type: 'PLATINUM', count: 30 }
            ]
        },
        {
            name: 'Prasad Large Screen Multiplex',
            city: 'Hyderabad',
            address: 'NTR Gardens, Necklace Road, Hyderabad, Telangana 500063',
            type: 'MULTIPLEX',
            totalSeats: 220,
            totalScreens: 6,
            seatTiers: [
                { row: 'A', type: 'PLATINUM', count: 20 },
                { row: 'B', type: 'PLATINUM', count: 20 },
                { row: 'C', type: 'GOLD', count: 25 },
                { row: 'D', type: 'GOLD', count: 25 },
                { row: 'E', type: 'GOLD', count: 25 },
                { row: 'F', type: 'SILVER', count: 25 },
                { row: 'G', type: 'SILVER', count: 25 },
                { row: 'H', type: 'SILVER', count: 25 },
                { row: 'I', type: 'FRONT', count: 15 },
                { row: 'J', type: 'FRONT', count: 15 }
            ]
        }
    ];

    const seededVenues = [];

    for (const vConfig of venueConfigs) {
        // Upsert venue
        let existingVenue = await prisma.venue.findFirst({
            where: { name: vConfig.name, city: vConfig.city }
        });

        if (existingVenue) {
            existingVenue = await prisma.venue.update({
                where: { id: existingVenue.id },
                data: {
                    address: vConfig.address,
                    type: vConfig.type,
                    totalSeats: vConfig.totalSeats,
                    totalScreens: vConfig.totalScreens
                }
            });
            console.log(`Updated venue: ${existingVenue.name} (ID: ${existingVenue.id})`);
        } else {
            existingVenue = await prisma.venue.create({
                data: {
                    name: vConfig.name,
                    city: vConfig.city,
                    address: vConfig.address,
                    type: vConfig.type,
                    totalSeats: vConfig.totalSeats,
                    totalScreens: vConfig.totalScreens
                }
            });
            console.log(`Created venue: ${existingVenue.name} (ID: ${existingVenue.id})`);
        }

        // Generate seats if not already present
        const currentSeatCount = await prisma.seat.count({ where: { venueId: existingVenue.id } });
        if (currentSeatCount === 0) {
            const seatsToCreate = [];
            for (const tier of vConfig.seatTiers) {
                for (let i = 1; i <= tier.count; i++) {
                    seatsToCreate.push({
                        seatNumber: `${tier.row}${i}`,
                        row: tier.row,
                        type: tier.type,
                        venueId: existingVenue.id
                    });
                }
            }
            const res = await prisma.seat.createMany({ data: seatsToCreate });
            console.log(`  Added ${res.count} seats for venue ${existingVenue.name}`);
        } else {
            console.log(`  Venue ${existingVenue.name} already has ${currentSeatCount} seats.`);
        }

        seededVenues.push({ venue: existingVenue, tiers: vConfig.seatTiers });
    }

    console.log('\n--- Step 3: Seeding Events ---');
    const eventDefinitions = [
        {
            title: 'Dune: Part Two',
            description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
            releaseDate: new Date('2024-03-01T00:00:00.000Z'),
            poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
            rating: 8.6,
            venueNames: ['PVR ICON: Phoenix Palladium', 'Prasad Large Screen Multiplex']
        },
        {
            title: 'Oppenheimer: 70mm Special',
            description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
            releaseDate: new Date('2023-07-21T00:00:00.000Z'),
            poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
            rating: 8.9,
            venueNames: ['PVR Directors Cut: Ambience Mall', 'PVR ICON: Phoenix Palladium']
        },
        {
            title: 'Interstellar: 10th Anniversary IMAX',
            description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.',
            releaseDate: new Date('2024-11-07T00:00:00.000Z'),
            poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
            rating: 8.7,
            venueNames: ['INOX Megaplex: Inorbit Mall', 'Prasad Large Screen Multiplex']
        },
        {
            title: 'Kalki 2898 AD',
            description: 'A modern avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces.',
            releaseDate: new Date('2024-06-27T00:00:00.000Z'),
            poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            rating: 7.6,
            venueNames: ['Radhakrishna 3d theatre', 'Prasad Large Screen Multiplex']
        },
        {
            title: 'Stree 2: Sarkate Ka Aatank',
            description: 'The town of Chanderi is being haunted again, this time by a headless entity named Sarkata that kidnaps modern women.',
            releaseDate: new Date('2024-08-15T00:00:00.000Z'),
            poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
            rating: 7.4,
            venueNames: ['Radhakrishna 3d theatre', 'INOX Megaplex: Inorbit Mall']
        },
        {
            title: 'Gladiator II',
            description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum.',
            releaseDate: new Date('2024-11-22T00:00:00.000Z'),
            poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
            rating: 7.8,
            venueNames: ['PVR Directors Cut: Ambience Mall', 'PVR ICON: Phoenix Palladium']
        }
    ];

    for (const eDef of eventDefinitions) {
        for (const vName of eDef.venueNames) {
            const v = seededVenues.find(sv => sv.venue.name === vName);
            if (!v) continue;
            
            const existingEvent = await prisma.event.findFirst({
                where: { title: eDef.title, venueId: v.venue.id }
            });

            if (!existingEvent) {
                const created = await prisma.event.create({
                    data: {
                        title: eDef.title,
                        description: eDef.description,
                        releaseDate: eDef.releaseDate,
                        poster: eDef.poster,
                        rating: eDef.rating,
                        venueId: v.venue.id
                    }
                });
                console.log(`Created event "${created.title}" at ${v.venue.name} (ID: ${created.id})`);
            } else {
                console.log(`Event "${existingEvent.title}" already exists at ${v.venue.name} (ID: ${existingEvent.id})`);
            }
        }
    }

    console.log('\n--- Seeding Summary ---');
    console.log('Total Venues in DB:', await prisma.venue.count());
    console.log('Total Events in DB:', await prisma.event.count());
    console.log('Total Seats in DB:', await prisma.seat.count());
}

seedData().then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
}).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
});
