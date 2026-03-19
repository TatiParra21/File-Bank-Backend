
import express from  'express'
import type { Request,Response, Router } from "express"
import crypto from "crypto";
import bcrypt from 'bcrypt'
import { prisma } from './lib/prismaDB';
import { Prisma } from "../generated/prisma/client";
import { sendVerificationEmail } from './lib/node-mailer';
import { hashPassword } from './hashPassword'
import jwt from 'jsonwebtoken'
export const router : Router = express.Router()
import dotenv from "dotenv";
import { authMiddleWare } from './Middlewares/authMiddleWare'
import asyncHandler from "express-async-handler"
import { AppError } from './AppError';
dotenv.config();
type SignUpResponse={
    message:string
}
router.post("/sign-up",asyncHandler(async (req:Request,res:Response<SignUpResponse>) =>{
    const {email, password} = req.body
    const hashedPassword = await hashPassword(password)
    const verificationToken = crypto.randomBytes(32).toString("hex");
        await prisma.users.create({
        data: {
        email: email,
        password_hash: hashedPassword,
        verified: false,
        verification_code: verificationToken
    }})

    await sendVerificationEmail(email,verificationToken)       
    res.status(200).json({ message:"Verification email Sent"})
}))

type LogInResponse ={
    userId:number, email:string
}
router.post("/log-in", asyncHandler(async(req:Request,res:Response<LogInResponse>)=>{   
    const {email, password} = req.body
    const user = await prisma.users.findUnique({where:{email:email}})
   if (!user || !(await bcrypt.compare(password, user.password_hash))|| !user.verified) {
 throw new AppError("Invalid Email or password",401)
}  
    const token = jwt.sign({userId:user.id,email:user.email, verified:user.verified},process.env.JWT_SECRET!, {expiresIn:"1d"})
     res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // true in production (https)
  })
   res.status(200).json({userId:user.id, email:user.email})
    return 
}))

router.post("/log-out", asyncHandler(async(req:Request,res:Response<{loggedOut:boolean}>)=>{   
    res.clearCookie("token",{
         httpOnly: true,
        sameSite: "lax",
        secure: false,
    })
    res.json({ loggedOut: true})  
    return
 
    
}))

router.post("/resend-verification", asyncHandler(async(req:Request,res:Response)=>{
    const {email, password} = req.body   
    const user= await prisma.users.findUnique({where:{email:email}})
     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new AppError("Invalid Email or password",401)
        }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.users.update({
        where:{id:user.id},
        data:{    
            verification_code: verificationToken
        }
    })
await sendVerificationEmail(email,verificationToken)
     res.status(200).json({ message:"Verification Email Sent"})
}))
