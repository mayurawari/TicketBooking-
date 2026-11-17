import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./src/configs/db.js";
import userrouter from "./src/routes/UserRoute.js";
import cookieParser from "cookie-parser";
import authmiddleware from "./src/middlewares/auth.js";
import venuerouter from "./src/routes/VenueRoute.js";
import eventrouter from "./src/routes/EventRoute.js";
import seatrouter from "./src/routes/SeatRoute.js";
import bookingrouter from "./src/routes/BookingRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 9090;

// Trust reverse proxies (Render, Railway, AWS ALB, Vercel) for HTTPS cookie handling
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

const extraOrigins = (process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:9090",
    ...extraOrigins
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            allowedOrigins.includes("*") ||
            (process.env.NODE_ENV === "production" && origin.endsWith(".vercel.app"))
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(express.json());
app.use(cookieParser());

// Authentication routes
app.use("/auth", userrouter);

// Public read-only catalog routes (matches BookMyShow browsing behavior)
app.use("/api/venue", (req, res, next) => {
    if (req.method === "GET") return venuerouter(req, res, next);
    return authmiddleware(req, res, () => venuerouter(req, res, next));
});

app.use("/api/event", (req, res, next) => {
    if (req.method === "GET") return eventrouter(req, res, next);
    return authmiddleware(req, res, () => eventrouter(req, res, next));
});

app.use("/api/seat", (req, res, next) => {
    if (req.method === "GET") return seatrouter(req, res, next);
    return authmiddleware(req, res, () => seatrouter(req, res, next));
});

// Booking routes - allows public ticket view (/api/booking/public/:ref) without auth
app.use("/api/booking", (req, res, next) => {
    if (req.path.startsWith("/public/")) {
        return bookingrouter(req, res, next);
    }
    return authmiddleware(req, res, () => bookingrouter(req, res, next));
});

app.get("/", async (req, res) => {
    res.json({
        name: "TicketPass Cinema Booking API",
        version: "1.0.0",
        status: "online",
        documentation: "/health"
    });
});

// Comprehensive production health check
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: "healthy",
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    } catch (dbErr) {
        res.status(503).json({
            status: "unhealthy",
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: dbErr.message
        });
    }
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
});

const server = app.listen(port, async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log(`Database connected successfully.`);
        console.log(`TicketPass API listening on port ${port} (NODE_ENV: ${process.env.NODE_ENV || "development"})`);
    } catch (err) {
        console.error("Database connection warning on startup:", err);
    }
});

// Graceful shutdown handling for container & platform environments
const handleShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Gracefully terminating server...`);
    server.close(async () => {
        try {
            await prisma.$disconnect();
            console.log("Prisma database connection cleanly closed.");
        } catch (e) {
            console.error("Error during database disconnect:", e);
        }
        process.exit(0);
    });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
