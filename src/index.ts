import express, { Request, Response } from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose"
import myUserRoute from "./routes/MyUserRoute"
import { v2 as cloudinary } from "cloudinary"
import myRestaurantRoute from "./routes/MyRestaurantRoute"
import restaurantRoute from "./routes/RestaurantRoute";
import orderRoute from "./routes/OrderRoute"

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(()=> console.log("🍀 Mongodb database connected"))

//Cloudinary for image 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
    
const app = express()
app.use(cors())

//for security and verification
app.use("/api/order/checkout/webhook" , express.raw({ type: "*/*" }))
app.use(express.json())
  
// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/check" , async(req: Request, res: Response) => {
  res.json({message: "Backend Working Properly"})
})

app.use("/api/my/user" , myUserRoute)
app.use("/api/my/restaurant" , myRestaurantRoute)
app.use("/api/restaurant" , restaurantRoute)
app.use("/api/order" , orderRoute)

app.get("/test" , async (req,res) => {
  res.json({ message : "Hello world" });
})

app.listen(7000, () => {
  console.log("⚙️  Server running on port 7000")
})