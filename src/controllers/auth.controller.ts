import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {generateToken} from "../utils/jwt.utils";
const prisma = new PrismaClient();

export const login = async(req: Request, res: Response) =>{
    try{
        const{ email , password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                message : "Email and password are required."
            });
        }

        const user = await prisma.user.findUnique({
            where:{
                email: email
            }
        });

        if(!user){
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }

        const token= generateToken(user.user_id);

        return res.status(200).json({
            message: "Login sucessful. ",
            token,
            user
        });

    }catch(error){
        return res.status(500).json({
            message: "Internal server error."
        });
    }
}

export const register = async(req: Request, res: Response) =>{
    try{
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                message : "Name, Email and password are required."
            });
        }

        const emailexists = await prisma.user.findUnique({
            where:{
                email: email
            }
        });

        if (emailexists){
            return res.status(409).json({
                message : "Email aleady exists."
            })
        }

        const hashed_password= await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashed_password
            }
        });

        const token = generateToken(user.user_id);

        return res.status(201).json({
            message: "User registeration is successful.",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile_picture: user.profile_picture,
                bio: user.bio
            }
        });
    }catch(error){
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};