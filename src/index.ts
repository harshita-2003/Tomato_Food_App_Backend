import express, { Request, Response } from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose"
import myUserRoute from "./routes/MyUserRoute"
import { v2 as cloudinary } from "cloudinary"
import myRestaurantRoute from "./routes/MyRestaurantRoute"

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
app.use(express.json())
// app.use(cors())
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

  
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

app.get("/test" , async (req,res) => {
  res.json({ message : "Hello world" });
})

app.listen(7000, () => {
  console.log("⚙️  Server running on port 7000")
})