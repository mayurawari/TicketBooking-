import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {prisma} from "./src/configs/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


app.get("/", async(req,res)=>{
    res.send("Welcome to the Ticket Booking API");
})


app.listen(port, async() => {
    try{
        await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection successful");
        console.log(`Server running on http://localhost:${port}`);
    }catch(err){
        console.error(err);
    }
});
