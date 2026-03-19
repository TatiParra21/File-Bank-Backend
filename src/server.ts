
import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import cors from 'cors'
import { router } from './DB-Router'
import { prisma } from './lib/prismaDB'
import cookieParser from "cookie-parser"
import type { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { Prisma } from "../generated/prisma/client";
import { authMiddleWare } from './Middlewares/authMiddleWare'
import jwt from "jsonwebtoken";
const app = express()
app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use(cookieParser())

app.use("/file-bank",router)

const PORT = 400
app.get("/verify",async(req:Request,res:Response)=>{
    const token = req.query.token as string
    const user = await prisma.users.findFirst({
  where: {
    verification_code: token
  }
})
    if (!user) return res.status(400).send("Invalid verification token")   
    await prisma.users.update({
        where:{id:user.id},
        data:{
            verified:true,
            verification_code: null
        }
    })
   return res.redirect('http://localhost:3000')
}),


app.get("/check-user",(req:Request,res:Response)=>{
      const token = req.cookies.token
            console.log(token, "TOKEN??")
            if(!token)return res.status(401).json({
        authenticated: false,
        user: null
      })
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        if(!decoded.verified)return res.status(401).json({
        authenticated: false,
        user: null
      })   
            req.user = decoded; // Assuming you've extended the Request type 
            console.log(req, "req")
     return res.status(200).json({
      authenticated: true,
    user: req.user
  })
})
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Global Error Logger]:", err);
  // Format a consistent error response for your frontend
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";
   // 1. Is it a known Prisma error for a duplicate email?
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({ 
          success: false, 
          error: "An account with this email already exists." 
      });
  }
 return res.status(statusCode).json({
    success: false,
    error: message,
  });
});

app.listen(PORT,()=>{console.log(`Server running at http://localhost:${PORT}`)})