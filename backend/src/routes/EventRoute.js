import { Router } from "express"
import { prisma } from "../configs/db.js"

const eventrouter = Router();

eventrouter.get("/", async (req, res) => {
    try {
        res.send("this is eventroute");
    } catch (error) {
        res.send("Error in eventrouter", error);
    }
})

//Event Route
// model Event {
//   id          Int       @id @default(autoincrement())
//   title       String
//   description String?
//   releaseDate DateTime?
//   poster      String?
//   rating      Float?

//   venueId     Int
//   venue       Venue     @relation(fields: [venueId], references: [id])

//   bookings    Booking[]

//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
// }
eventrouter.post("/createevent", async (req, res) => {
    const { title, description, releaseDate, poster, rating, venueId } = req.body;
    try {
        if (!title || !venueId) {
            return res.json({ " message": "Title and venueId are required" });
        }

        const newevent = await prisma.event.create({
            data: {
                title,
                description,
                releaseDate: releaseDate ? new Date(releaseDate) : null,
                poster,
                rating,
                venueId: Number(venueId),
            }
        })

        res.status(201).json({ "message": "Event created successfully", newevent });
    } catch (error) {
        console.log("error in creating event", error);
        res.send("error while creating event", error);
    }
})

//get events
eventrouter.get("/getevents", async (req, res) => {
    try {
        const { title, city } = req.query;

        const where = {};

        if (city) {
            where.venue = {
                city: {
                    equals: city,
                    mode: "insensitive"
                }
            };
        }

        if (title) {
            where.title = {
                contains: title,
                mode: "insensitive"
            }
        }

        const allevents = await prisma.event.findMany({
            where,
            take: 10
        });

        res.status(200).json({ "Message": "The events", allevents });
    } catch (error) {
        console.log("Error getting events", error);
        res.send("Error getting events", error);
    }
})

//get events by id 
eventrouter.get("/oneevent/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const eventId = Number(id);
        const getevent = await prisma.event.findUnique({ where: { id: eventId } })
        if (!getevent) {
            return res.send("No event found");
        }
        res.status(200).json({ "Message": "The event", getevent });
    } catch (error) {
        console.log("Error getting event", error);
        res.send("Error getting event", error);
    }
})
//update events by id 
// 4	PATCH	/events/:id	Update event
eventrouter.patch("/updateevent/:id", async (req, res) => {
    const { title, description, releaseDate, poster, rating, venueId } = req.body;
    try {
        const { id } = req.params;
        const eventId = Number(id);
        const getevent = await prisma.event.findUnique({ where: { id: eventId } })
        if (!getevent) {
            return res.send("No event found");
        }
        const data = {};
        if (title !== undefined) {
            data.title = title
        }
        if (description !== undefined) {
            data.description = description
        }
        if (releaseDate !== undefined) {
            data.releaseDate = new Date(releaseDate)
        }
        if (poster !== undefined) {
            data.poster = poster
        }
        if (rating !== undefined) {
            data.rating = rating
        }
        if (venueId !== undefined) {
            data.venueId = Number(venueId)
        }

        const saveevent = await prisma.event.update({ where: { id: eventId }, data });
        res.status(200).json({ "Message": "The event updated", saveevent });
    } catch (error) {
        console.log("Error updating event", error);
        res.send("Error updating event", error);
    }
})

// 5	DELETE	/events/:id	Delete event
eventrouter.delete("/deleteevent/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const eventId = Number(id);
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).send("No event found");
        }
        const deleteevent = await prisma.event.delete({ where: { id: eventId } });
        res.status(200).json({ "Message": "The event deleted", deleteevent });
    } catch (error) {
        console.log("Error getting event", error);
        res.send("Error getting event", error);
    }
})


export default eventrouter;