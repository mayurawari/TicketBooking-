import {Router} from "express";
import {prisma} from "../configs/db.js"

const seatrouter = Router();

seatrouter.get("/",async(req,res)=>{
    try {
        res.send("This is seatroute");
    } catch (error) {
        console.log(error);
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
seatrouter.post("/venues/:venueId/seats",async(req,res)=>{
    const { venueId } = req.params;
    const {seats} = req.body; //seatNumber, row, type, venueId
    try {
        if(!Array.isArray(seats) || seats.length === 0){
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

        const seatData = seats.map(seat => ({
            ...seat,
            venueId: Number(venueId)
        }));

        const createseats = await prisma.seat.createMany({data:seats});

        res.status(201).json({"Message":"The seats are created successfully",createseats});
    } catch (error) {
        console.log("Error creating seats",error);
        res.status(501).send("Error in creating seats",error);
    }
})
// 7	GET	/venues/:venueId/seats	Get seats for a venue
// 8	GET	/seats/:id	Get one seat
// 9	PATCH	/seats/:id	Update seat
// 10	DELETE	/seats/:id	Delete seat


