
import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import cors from 'cors'
import { router } from './DB-Router'
import { prisma } from './db'
import cookieParser from "cookie-parser"
import type { Request, Response, NextFunction } from "express"

import { authMiddleWare } from './authMiddleWare'
const app = express()
app.use(express.json())
app.use(cors())
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
app.get("me",authMiddleWare,(req:Request,res:Response)=>{
    
     return res.status(200).json({
    user: req.user
  })
})

app.listen(PORT,()=>{console.log(`Server running at http://localhost:${PORT}`)})