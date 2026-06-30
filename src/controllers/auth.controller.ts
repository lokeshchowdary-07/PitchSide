import express from "express";
import bodyparser from "body-parser";
import { PrismaClient } from "@prisma/client";
const app=express();
const prisma = new PrismaClient();

// app.post('/login', (req, res)=>{
//     const {username, password} = req.body;
//     const user = await prisma.user.findUnique({
//         where: {
//             name: username,
//             password: password,
//         }
//     })
//     if(!user){
        
//     }
// })