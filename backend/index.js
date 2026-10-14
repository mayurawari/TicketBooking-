import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./src/configs/db.js";
import userrouter from "./src/routes/UserRoute.js";
import cookieParser from "cookie-parser";
import authmiddleware from "./src/middlewares/auth.js";
import { adminMiddleware } from "./src/middlewares/auth.js";
import venuerouter from "./src/routes/VenueRoute.js";
import eventrouter from "./src/routes/EventRoute.js";
import seatrouter from "./src/routes/SeatRoute.js";
import bookingrouter from "./src/routes/BookingRoute.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", userrouter);
app.use("/api/venue", authmiddleware, venuerouter);
app.use("/api/event", authmiddleware, eventrouter);
app.use("/api/seat", authmiddleware, seatrouter);
app.use("/api/booking", authmiddleware, bookingrouter);

app.get("/", async (req, res) => {
    res.send("Welcome to the Ticket Booking API");
});

app.get("/health", async (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(port, async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection successful");
        console.log(`Server running on http://localhost:${port}`);
    } catch (err) {
        console.error("Database connection failed on startup:", err);
    }
});