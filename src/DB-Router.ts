
import express from  'express'
import type { Request,Response, Router } from "express"
import crypto from "crypto";
import bcrypt from 'bcrypt'
import { prisma } from './db';
import { Prisma } from "../generated/prisma/client";
import { sendVerificationEmail } from './node-mailer';
import { hashPassword } from './hashPassword'
import jwt from 'jsonwebtoken'
export const router : Router = express.Router()
import dotenv from "dotenv";
import { authMiddleWare } from './authMiddleWare';

dotenv.config();

router.post("/sign-up",async(req:Request,res:Response)=>{
    const {email, password} = req.body
    const hashedPassword = await hashPassword(password)
    console.log(hashedPassword, "hass")
    const verificationToken = crypto.randomBytes(32).toString("hex");
    try{
        await prisma.users.create({
        data: {
        email: email,
        password_hash: hashedPassword,
        verified: false,
        verification_code: verificationToken
    }
})
    sendVerificationEmail(email,verificationToken)       
    }catch(err){
        if(err instanceof Prisma.PrismaClientKnownRequestError){
             if(err.code == "P2002")return res.status(400).json({message: "An account with email Already exists",})

        }
       
           
        console.error("Database error", err)
        return res.status(500).json({ message:"Internal server Error"})
    }
   return  res.status(200).json({ message:"Account created verify by email"})
})

router.post("/log-in", async(req:Request,res:Response)=>{   
    const {email, password} = req.body
    const user = await prisma.users.findUnique({where:{email:email, verified: true}})
   if (!user || !(await bcrypt.compare(password, user.password_hash))) {
  return res.status(401).json({ message: "Invalid email or password" });
}
    if (!user.verified) {
    return res.status(403).json({ 
     message: "Account not verified",
        requiresVerification: true,
        email: user.email // Helpful for the frontend 'Resend' button
    });
    }    
    const token = jwt.sign({userId:user.id,email:user.email},process.env.JWT_SECRET!, {expiresIn:"1d"})
     res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // true in production (https)
  })
    return res.status(200).json({authorized:true})
})

router.post("/resend-verification",async(req:Request,res:Response)=>{
    const {email, password} = req.body  
    try{
     const user= await prisma.users.findUnique({where:{email:email}})
     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
  return res.status(401).json({ message: "Invalid email or password" });
}
 const verificationToken = crypto.randomBytes(32).toString("hex");
  await prisma.users.update({
        where:{id:user.id},
        data:{    
            verification_code: verificationToken
        }
    })
console.log("was it here", verificationToken)
sendVerificationEmail(email,verificationToken)
        
    }catch(err){
        if(err instanceof Prisma.PrismaClientKnownRequestError)
        if(err.code == "P2002")return res.status(400).json({message: "An account with email Already exists",})
            else{
        console.error("unknown error", err)}
    }
     res.status(200).json({ message:"Account created verify by email"})
})
