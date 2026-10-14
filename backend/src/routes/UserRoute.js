import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { prisma } from '../configs/db.js';
import authmiddleware from '../middlewares/auth.js';
config();

const key = process.env.KEY;
const userrouter = Router();

const isProd = process.env.NODE_ENV === "production";
const getCookieOptions = (maxAge, path = "/") => ({
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge,
    path
});

userrouter.get("/", async (req, res) => {
    try {
        res.send("This is the user route");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Current user profile route
userrouter.get("/me", authmiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User profile fetched", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Register route
userrouter.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const existuser = await prisma.user.findUnique({ where: { email } });

        if (existuser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const createuser = await prisma.user.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, 10)
            }
        });

        const accesstoken = jwt.sign({ id: createuser.id, role: createuser.role }, key, { expiresIn: "15m" });
        const refreshtoken = jwt.sign({ id: createuser.id, role: createuser.role }, key, { expiresIn: "7d" });

        res.cookie("accesstoken", accesstoken, getCookieOptions(15 * 60 * 1000, "/"));
        res.cookie("refreshtoken", refreshtoken, getCookieOptions(7 * 24 * 60 * 60 * 1000, "/auth/refresh"));

        res.status(201).json({
            message: "User registered successfully",
            user: { id: createuser.id, email: createuser.email, name: createuser.name, role: createuser.role },
            token: accesstoken
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Login route
userrouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const accesstoken = jwt.sign({ id: user.id, role: user.role }, key, { expiresIn: "15m" });
        const refreshtoken = jwt.sign({ id: user.id, role: user.role }, key, { expiresIn: "7d" });

        res.cookie("accesstoken", accesstoken, getCookieOptions(15 * 60 * 1000, "/"));
        res.cookie("refreshtoken", refreshtoken, getCookieOptions(7 * 24 * 60 * 60 * 1000, "/auth/refresh"));

        res.json({
            message: "Login successful",
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token: accesstoken
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Refresh token route
userrouter.post("/refresh", async (req, res) => {
    try {
        const token = req.cookies?.refreshtoken || req.body?.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(token, key);

        // Fetch latest user data to get current role
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const accesstoken = jwt.sign({ id: user.id, role: user.role }, key, { expiresIn: "15m" });

        res.cookie("accesstoken", accesstoken, getCookieOptions(15 * 60 * 1000, "/"));

        res.json({
            message: "Token refreshed successfully",
            token: accesstoken,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Refresh token expired, please login again" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

//Logout route
userrouter.delete("/logout", async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("accesstoken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/"
    });

    res.clearCookie("refreshtoken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/auth/refresh"
    });

    res.json({
        message: "Logout successful"
    });
});

export default userrouter;