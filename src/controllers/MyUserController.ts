import { Request , Response } from "express";
import User from "../models/user";


const getCurrentUser = async (req: Request , res:Response) => {
    try {
        const finduser = await User.findOne({_id: req.userId})

        if(!finduser) { 
            res.status(404).json({ message: "Cannot find the User you are looking for !!" })
        }

        res.status(200).json(finduser);
        console.log(finduser)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching user details" })
    }
}

const createCurrentUser = async (req: Request , res:Response) => {
    try {
        const { auth0Id } = req.body;
        //1. check if user exists
        const existingUser = await User.findOne({ auth0Id })
        if(existingUser) {
            return res.status(400).json({message: "User already exists !!"})
        }

        //2. create the user if not
        const newUser = new User(req.body)
        await newUser.save()

        //3. return user object to calling client
        res.status(200).json(newUser.toObject())

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Error Creating User"})
    }
}

const updateCurrentUser = async(req: Request , res:Response) => {
    try {
        const { name,address,country,city } = req.body;
        const user = await User.findById(req.userId)

        if(!user) {
            return res.status(404).json({ message: "user not found" })
        }

        user.name = name;
        user.address = address;
        user.country = country;
        user.city = city;

        await user.save();
        res.send(user);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" })
    }
}

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser
}