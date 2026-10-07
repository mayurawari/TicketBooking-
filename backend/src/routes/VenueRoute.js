import { Router } from "express";
import { config } from "dotenv";
import { prisma } from "../configs/db.js";

config();
const venuerouter = Router();

venuerouter.get("/", (req, res) => {
    res.send("This is venue route");
})
// create venue 
// model Venue {
//   id           Int         @id @default(autoincrement())
//   name         String
//   address      String
//   city         String
//   type         TheatreType
//   totalSeats   Int
//   totalScreens Int

//   events       Event[]
//   seats        Seat[]

//   createdAt    DateTime    @default(now())
//   updatedAt    DateTime    @updatedAt
// }
venuerouter.post("/createvenue", async (req, res) => {
    const { name, city, address, type, totalSeats, totalScreens } = req.body;
    try {
        if (name === undefined ||
            city === undefined ||
            address === undefined ||
            type === undefined ||
            totalSeats === undefined ||
            totalScreens === undefined) {
            return res.send("All fields are not provided");
        }

        const createVenue = await prisma.venue.create({
            data: {
                name,
                city,
                address,
                type,
                totalSeats: Number(totalSeats),
                totalScreens: Number(totalScreens)
            }
        })

        res.status(201).json({ "Message": "The venue created successfully it will be refelected within 2-3 hours", createVenue });

    } catch (error) {
        console.log("venue creation", error);
        res.status(500).send("Error while creating venue");
    }
})


// Get venues
venuerouter.get("/getvenues", async (req, res) => {
    const { event, city } = req.query;
    try {
        const where = {};
        if (city) {
            where.city = {
                equals: city,
                mode: "insensitive"
            };
        }

        if (event) {
            where.events = {
                some: {
                    title: {
                        contains: event,
                        mode: "insensitive"
                    }
                }
            };
        }

        const venues = await prisma.venue.findMany({ where });

        return res.status(200).json({
            message: "Venues fetched successfully",
            venues
        });


    } catch (error) {
        console.log("error in finding venues", error);
        res.status(401).send(error);
    }
})

// Get venues by id
venuerouter.get("/getvenue/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const venueid = Number(id);

        const venue = await prisma.venue.findUnique({
            where: { id: venueid }
        })

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        return res.status(200).json({
            message: "Venue fetched successfully",
            venue
        });


    } catch (error) {
        console.log("error in fetching venue", error);
        res.status(401).send(error);
    }
})

// PATCH  /venues/:id
venuerouter.patch("/getvenue/:id", async (req, res) => {
    const { name, city, address, type, totalSeats, totalScreens } = req.body;
    try {

        const data = {};

        if (name !== undefined) data.name = name;
        if (city !== undefined) data.city = city;
        if (address !== undefined) data.address = address;
        if (type !== undefined) data.type = type;

        if (totalSeats !== undefined)
            data.totalSeats = Number(totalSeats);

        if (totalScreens !== undefined)
            data.totalScreens = Number(totalScreens);

        const { id } = req.params;
        const venueid = Number(id);

        const venue = await prisma.venue.findUnique({
            where: { id: venueid }
        })

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        const patchedvenue = await prisma.venue.update({
            where: {
                id: venueid
            },
            data
        })

        return res.status(200).json({
            message: "Venue pathched successfully",
            venue: patchedvenue
        });


    } catch (error) {
        console.log("error in pathching venue", error);
        res.status(500).send(error);
    }
})
// DELETE /venues/:id
venuerouter.delete("/deletevenue/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const venueid = Number(id);

        const venue = await prisma.venue.findUnique({
            where: { id: venueid }
        })

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        const deletevenue = await prisma.venue.delete({ where: { id: venueid } })

        return res.status(200).json({
            message: "Venue deleted successfully",
            deletevenue
        });


    } catch (error) {
        console.log("error in pathching venue", error);
        res.status(401).send(error);
    }
})


export default venuerouter;