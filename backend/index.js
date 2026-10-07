import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {prisma} from "./src/configs/db.js";
import userrouter from "./src/routes/UserRoute.js";
import cookieParser from "cookie-parser";
import http from 'http'
import authmiddleware from "./src/middlewares/auth.js";
import venuerouter from "./src/routes/VenueRoute.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/auth", userrouter);
app.use("/api/venue", authmiddleware, venuerouter);

app.get("/", async(req,res)=>{
    res.send("Welcome to the Ticket Booking API");
})

// console.log(http);

app.listen(port, async() => {
    try{
        await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection successful");
        console.log(`Server running on http://localhost:${port}`);
    }catch(err){
        console.error(err);
    }
});


// {
//   "email":"mayurawari50@gmail.com",
//   "password":"123456"
// }

// {
//   "name":"Radhakrishna 3d theatre",
//   "address" : "Near varoranaka, under varoranaka flyover, tukum, chandrapur, Maharashtra",
//   "type": "THEATRE",
//   "totalSeats": "660",
//   "totalScreens":"1"
// }