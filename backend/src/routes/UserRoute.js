import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { prisma } from '../configs/db.js';
config();

const key = process.env.KEY;
const userrouter = Router();

userrouter.get("/", async (req, res) => {
    try {
        res.send("This is the user route");
    } catch (error) {
        console.log(error);
    }
})


//Register route
userrouter.post("/register", async (req, res) => {
    const { name , email, password } = req.body;
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

        const accesstoken = jwt.sign({ id: createuser.id }, key, { expiresIn: "15m" });

        const refreshtoken = jwt.sign({ id: createuser.id }, key, { expiresIn: "7d" });

        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15min
            path: "/"

        })

        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 1000, // 7days
            path: "/auth/refresh"

        })

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})
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

        const accesstoken = jwt.sign({ id: user.id }, key, { expiresIn: "15m" });

        const refreshtoken = jwt.sign({ id: user.id }, key, { expiresIn: "7d" });

        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, //15 min
            path: "/"
        })

        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/auth/refresh"
        })

        res.json({ message: "Login successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//Logout route
userrouter.delete("/logout", async (req, res) => {
    res.clearCookie("accesstoken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.clearCookie("refreshtoken", {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"lax",
        path:"/auth/refresh"
    })

    res.json({
        message: "Logout successful"
    });
})

export default userrouter;