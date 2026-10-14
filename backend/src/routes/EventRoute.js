import { Router } from "express"
import { prisma } from "../configs/db.js"
import { adminMiddleware } from "../middlewares/auth.js"

const eventrouter = Router();

eventrouter.get("/", async (req, res) => {
    try {
        res.send("this is eventroute");
    } catch (error) {
        res.status(500).json({ message: "Error in eventrouter" });
    }
})

//Event Route
eventrouter.post("/createevent", adminMiddleware, async (req, res) => {
    const { title, description, releaseDate, poster, rating, venueId } = req.body;
    try {
        if (!title || !venueId) {
            return res.status(400).json({ message: "Title and venueId are required" });
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

        res.status(201).json({ message: "Event created successfully", newevent });
    } catch (error) {
        console.log("error in creating event", error);
        res.status(500).json({ message: "Error while creating event" });
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

        res.status(200).json({ message: "The events", allevents });
    } catch (error) {
        console.log("Error getting events", error);
        res.status(500).json({ message: "Error getting events" });
    }
})

//get events by id 
eventrouter.get("/oneevent/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const eventId = Number(id);

        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const getevent = await prisma.event.findUnique({ where: { id: eventId } })
        if (!getevent) {
            return res.status(404).json({ message: "No event found" });
        }
        res.status(200).json({ message: "The event", getevent });
    } catch (error) {
        console.log("Error getting event", error);
        res.status(500).json({ message: "Error getting event" });
    }
})
//update events by id 
eventrouter.patch("/updateevent/:id", adminMiddleware, async (req, res) => {
    const { title, description, releaseDate, poster, rating, venueId } = req.body;
    try {
        const { id } = req.params;
        const eventId = Number(id);

        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const getevent = await prisma.event.findUnique({ where: { id: eventId } })
        if (!getevent) {
            return res.status(404).json({ message: "No event found" });
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
        res.status(200).json({ message: "The event updated", saveevent });
    } catch (error) {
        console.log("Error updating event", error);
        res.status(500).json({ message: "Error updating event" });
    }
})

// DELETE /events/:id
eventrouter.delete("/deleteevent/:id", adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const eventId = Number(id);

        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).json({ message: "No event found" });
        }

        // Delete related bookings first to avoid FK constraint errors
        await prisma.booking.deleteMany({ where: { eventId: eventId } });

        const deleteevent = await prisma.event.delete({ where: { id: eventId } });
        res.status(200).json({ message: "The event deleted", deleteevent });
    } catch (error) {
        console.log("Error deleting event", error);
        res.status(500).json({ message: "Error deleting event" });
    }
})


export default eventrouter;