import { Router } from "express";
import { prisma } from "../configs/db.js";
import { adminMiddleware } from "../middlewares/auth.js";

const bookingrouter = Router();

// Pricing fallback based on seat type
const SEAT_TYPE_PRICING = {
    LUXURY: 500,
    PLATINUM: 350,
    GOLD: 250,
    SILVER: 180,
    FRONT: 120
};

// Base route
bookingrouter.get("/", (req, res) => {
    res.send("This is booking route");
});

// 1. Create a booking (User)
bookingrouter.post("/createbooking", async (req, res) => {
    try {
        const { eventId, seatId, seatIds, totalAmount, status } = req.body;
        const userId = req.user.id;

        const parsedEventId = Number(eventId);
        if (!Number.isInteger(parsedEventId) || parsedEventId <= 0) {
            return res.status(400).json({ message: "Valid eventId is required" });
        }

        // Normalize targetSeatIds to an array of valid positive integers
        const rawIds = Array.isArray(seatIds) ? seatIds : (seatId !== undefined ? [seatId] : []);
        const targetSeatIds = rawIds.map(Number).filter(id => Number.isInteger(id) && id > 0);

        if (targetSeatIds.length === 0) {
            return res.status(400).json({ message: "At least one valid seatId is required" });
        }

        // Verify Event existence
        const event = await prisma.event.findUnique({
            where: { id: parsedEventId },
            include: { venue: true }
        });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Verify all Seats exist and belong to the event's venue
        const seats = await prisma.seat.findMany({
            where: { id: { in: targetSeatIds } }
        });

        if (seats.length !== targetSeatIds.length) {
            return res.status(404).json({ message: "One or more seats not found" });
        }

        const mismatchedVenueSeat = seats.find(s => s.venueId !== event.venueId);
        if (mismatchedVenueSeat) {
            return res.status(400).json({
                message: `Seat belongs to venue #${mismatchedVenueSeat.venueId}, but event is held at venue #${event.venueId}`
            });
        }

        // Generate one shared booking reference for this order (BookMyShow pattern)
        const bookingReference = `BMS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Validate status if provided
        const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];
        const bookingStatus = status && validStatuses.includes(status) ? status : "CONFIRMED";

        // Atomic Interactive Transaction with Concurrency & Race condition checks
        const createdBookings = await prisma.$transaction(async (tx) => {
            // Check if ANY of the selected seats are already booked
            const alreadyBooked = await tx.booking.findMany({
                where: {
                    eventId: parsedEventId,
                    seatId: { in: targetSeatIds },
                    status: { in: ["CONFIRMED", "PENDING"] }
                }
            });

            if (alreadyBooked.length > 0) {
                const err = new Error("This seat has already been booked for this event");
                err.statusCode = 409;
                throw err;
            }

            // Create bookings for all seats sharing the bookingReference
            const results = [];
            for (const seat of seats) {
                let amount = Number(totalAmount);
                if (isNaN(amount) || amount <= 0 || targetSeatIds.length > 1) {
                    amount = SEAT_TYPE_PRICING[seat.type] || 200;
                }

                const newBooking = await tx.booking.create({
                    data: {
                        userId,
                        eventId: parsedEventId,
                        seatId: seat.id,
                        bookingReference,
                        totalAmount: amount,
                        status: bookingStatus
                    },
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                releaseDate: true,
                                poster: true,
                                venue: {
                                    select: { id: true, name: true, city: true, address: true }
                                }
                            }
                        },
                        seat: {
                            select: { id: true, seatNumber: true, row: true, type: true }
                        }
                    }
                });
                results.push(newBooking);
            }
            return results;
        });

        return res.status(201).json({
            message: "Booking created successfully",
            bookingReference,
            booking: createdBookings[0],
            bookings: createdBookings
        });

    } catch (error) {
        if (error.statusCode === 409 || error.code === "P2002") {
            return res.status(409).json({
                message: "This seat has already been booked for this event"
            });
        }
        console.log("Error creating booking", error);
        return res.status(500).json({ message: "Error creating booking" });
    }
});

// 2. Get current user's bookings
bookingrouter.get("/mybookings", async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                event: {
                    include: { venue: true }
                },
                seat: true
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({
            message: "User bookings fetched successfully",
            bookings
        });
    } catch (error) {
        console.log("Error fetching my bookings", error);
        return res.status(500).json({ message: "Error fetching user bookings" });
    }
});

// 3. Get all booked seat IDs for an event (useful for seat map)
bookingrouter.get("/event/:eventId/booked-seats", async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const bookedSeats = await prisma.booking.findMany({
            where: {
                eventId,
                status: { in: ["CONFIRMED", "PENDING"] }
            },
            select: {
                seatId: true,
                status: true,
                seat: {
                    select: { seatNumber: true, row: true, type: true }
                }
            }
        });

        return res.status(200).json({
            message: "Booked seats fetched",
            bookedSeats
        });
    } catch (error) {
        console.log("Error fetching booked seats", error);
        return res.status(500).json({ message: "Error fetching booked seats" });
    }
});

// 4. Get one booking by ID
bookingrouter.get("/onebooking/:id", async (req, res) => {
    try {
        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                event: { include: { venue: true } },
                seat: true
            }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // If not admin, verify ownership
        if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
            return res.status(403).json({ message: "Access denied to this booking" });
        }

        return res.status(200).json({
            message: "Booking details fetched",
            booking
        });
    } catch (error) {
        console.log("Error fetching booking", error);
        return res.status(500).json({ message: "Error fetching booking" });
    }
});

// 5. Cancel a booking
bookingrouter.patch("/cancelbooking/:id", async (req, res) => {
    try {
        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Ownership or admin check
        if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You cannot cancel another user's booking" });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
            include: {
                event: { select: { title: true } },
                seat: { select: { seatNumber: true, row: true } }
            }
        });

        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking: updatedBooking
        });
    } catch (error) {
        console.log("Error cancelling booking", error);
        return res.status(500).json({ message: "Error cancelling booking" });
    }
});

// 6. Admin: Get all bookings
bookingrouter.get("/allbookings", adminMiddleware, async (req, res) => {
    try {
        const { status, eventId } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (eventId) {
            const parsedEventId = Number(eventId);
            if (!isNaN(parsedEventId)) {
                where.eventId = parsedEventId;
            }
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                event: { select: { id: true, title: true, venue: { select: { name: true, city: true } } } },
                seat: { select: { seatNumber: true, row: true, type: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return res.status(200).json({
            message: "All bookings fetched",
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.log("Error fetching all bookings", error);
        return res.status(500).json({ message: "Error fetching all bookings" });
    }
});

// 7. Public route to view a shared ticket
bookingrouter.get("/public/:bookingReference", async (req, res) => {
    try {
        const { bookingReference } = req.params;
        if (!bookingReference) {
            return res.status(400).json({ message: "Booking reference is required" });
        }

        const bookings = await prisma.booking.findMany({
            where: { bookingReference },
            include: {
                event: { include: { venue: true } },
                seat: true,
                user: { select: { name: true, email: true } }
            }
        });

        if (bookings.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json({
            message: "Booking details fetched",
            bookingReference,
            event: bookings[0].event,
            user: bookings[0].user,
            status: bookings[0].status,
            totalAmount: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
            seats: bookings.map(b => ({
                id: b.id,
                seatId: b.seatId,
                seatNumber: b.seat.seatNumber,
                row: b.seat.row,
                type: b.seat.type,
                price: b.totalAmount,
                isScanned: b.isScanned,
                scannedAt: b.scannedAt
            })),
            createdAt: bookings[0].createdAt
        });
    } catch (error) {
        console.log("Error fetching public booking", error);
        return res.status(500).json({ message: "Error fetching public booking" });
    }
});

export default bookingrouter;
