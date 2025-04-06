import { NextFunction,Request,Response } from "express";
import { JWT_SECRET } from "./config";
import jsonwebtoken from "jsonwebtoken"

const jwt  = jsonwebtoken


export function userMiddleware(req : Request,res:Response,next:NextFunction){
    const token = req.headers["token"] 
    const datas  = jwt.verify(token as string,JWT_SECRET) 
    if(datas){
        //@ts-ignore 
        req.id = datas.id
        next()
    }else{
        res.json({
            message:"unauthorized"
        })
    }
}