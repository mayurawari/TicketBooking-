import { Router } from "express";
import { prisma } from "../configs/db.js"
import { adminMiddleware } from "../middlewares/auth.js"

const seatrouter = Router();

seatrouter.get("/", async (req, res) => {
    try {
        res.send("This is seatroute");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})
// 1	POST	/venues/:venueId/seats	Create a seat
// model Seat {
//   id         Int      @id @default(autoincrement())
//   seatNumber String
//   row        String
//   type       SeatType

//   venueId    Int
//   venue      Venue    @relation(fields: [venueId], references: [id])

//   bookings   Booking[]
// }
seatrouter.post("/venues/:venueId/seats", adminMiddleware, async (req, res) => {
    const venueId = Number(req.params.venueId);
    const { seats } = req.body; //seatNumber, row, type, venueId
    try {
        if (!Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({
                message: "Please provide a non-empty array of seats"
            });
        }

        const invalidSeat = seats.some(seat =>
            !seat.seatNumber ||
            !seat.row ||
            !seat.type
        );

        if (invalidSeat) {
            return res.status(400).json({
                message: "Seat data is incomplete"
            });
        }

        if (!Number.isInteger(venueId) || venueId <= 0) {
            return res.status(400).json({ message: "Invalid venue ID" });
        }

        const seatData = seats.map(seat => ({
            ...seat,
            venueId: Number(venueId)
        }));

        const createseats = await prisma.seat.createMany({ data: seatData });

        res.status(201).json({ "Message": "The seats are created successfully", createseats });
    } catch (error) {
        console.log("Error creating seats", error);
        res.status(500).json({ message: "Error in creating seats" });
    }
})

// 2	GET	/venues/:venueId/seats	Get seats for a venue
seatrouter.get("/venues/:venueId/seats", async (req, res) => {

    try {
        const venueId = Number(req.params.venueId);
        if (!Number.isInteger(venueId) || venueId <= 0) {
            return res.status(400).json({ message: "Invalid venue ID" });
        }
        const getvenue = await prisma.venue.findUnique({ where: { id: venueId }, include: { seats: true } });

        if (!getvenue) {
            return res.status(404).json({ "Message": "No venue Found" });
        }

        res.status(200).json({ "Message": "All seats for venue", "seats": getvenue.seats })
    } catch (error) {
        console.log("Error getting seats", error);
        res.status(500).json({ "Message": "Error gettting seats", error });
    }
})

// 3	GET	/seats/:id	Get one seat
seatrouter.get("/seats/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const seatId = Number(id);

        if (!Number.isInteger(seatId) || seatId <= 0) {
            return res.status(400).json({ message: "Invalid seat ID" });
        }

        const getseat = await prisma.seat.findUnique({ where: { id: seatId } });

        if (!getseat) {
            return res.status(404).json({ "Message": "No seat Found" });
        }

        res.status(200).json({ "Message": "seat", getseat });
    } catch (error) {
        console.log("Error getting seat", error);
        res.status(500).json({ "Message": "Error gettting seat", error });
    }
})

// 4	PATCH	/seats/:id	Update seat
seatrouter.patch("/seats/:id", adminMiddleware, async (req, res) => {

    try {
        const { id } = req.params;
        const { seatNumber, row, type, venueId } = req.body;
        const seatId = Number(id);

        if (!Number.isInteger(seatId) || seatId <= 0) {
            return res.status(400).json({ message: "Invalid seat ID" });
        }

        const getseat = await prisma.seat.findUnique({ where: { id: seatId } });

        if (!getseat) {
            return res.status(404).json({ "Message": "No seat Found" });
        }

        const data = {};
        if (seatNumber !== undefined) data.seatNumber = seatNumber;
        if (row !== undefined) data.row = row;
        if (type !== undefined) data.type = type;
        if (venueId !== undefined) data.venueId = Number(venueId);

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }

        const updateseat = await prisma.seat.update({ where: { id: seatId }, data: data });
        res.status(200).json({ "Message": "seat updated", updateseat });
    } catch (error) {
        console.log("Error getting seat", error);
        res.status(500).json({ "Message": "Error gettting seat", error });
    }
})

// 5    	DELETE	/seats/:id	Delete seat
seatrouter.delete("/seats/:id", adminMiddleware, async (req, res) => {

    try {
        const { id } = req.params;
        const seatId = Number(id);

        const getseat = await prisma.seat.findUnique({ where: { id: seatId } });

        if (!getseat) {
            return res.status(404).json({ "Message": "No seat Found" });
        }

        const deleteseat = await prisma.seat.delete({ where: { id: seatId } });

        res.status(200).json({ "Message": "seat deleted", deleteseat });
    } catch (error) {
        console.log("Error deleting seat", error);
        res.status(500).json({ "Message": "Error deleting seat", error });
    }
})


export default seatrouter;
