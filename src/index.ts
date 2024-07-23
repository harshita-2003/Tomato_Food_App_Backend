import express, { Request, Response } from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose"
import myUserRoute from "./routes/MyUserRoute"

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(()=> console.log("🍀 Mongodb database connected"))
    
const app = express()
app.use(express.json())
app.use(cors())
  
// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/check" , async(req: Request, res: Response) => {
  res.json({message: "Backend Working Properly"})
})

app.use("/api/my/user" , myUserRoute)

app.get("/test" , async (req,res) => {
    res.json({ message : "Hello world" });
})

app.listen(7000, () => {
    console.log("⚙️  Server running on port 7000")
})