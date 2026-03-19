import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

import { AppError } from "../AppError"
export const authMiddleWare =(req:Request, res:Response, next:NextFunction)=>{
        const token = req.cookies.token
        console.log(token, "TOKEN??")
        if(!token)return next(new AppError("Not authenticated",401)) 
           const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          if(!decoded.verified)return next(new AppError("user not verified",401)) 
          try {
       
        req.user = decoded; // Assuming you've extended the Request type
        next();
    } catch (err) {
    return next(new AppError("Invalid or expired token", 401))
  }
}