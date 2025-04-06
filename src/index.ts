console.log("radhe radhe") 


import express from "express" 
import { userModel ,accountModel } from "./db"
import jsonwebtoken from "jsonwebtoken"
import { JWT_SECRET } from "./config"
import { userMiddleware } from "./middleware"
import mongoose from "mongoose"

const jwt  = jsonwebtoken
const app = express()


app.use(express.json())


app.post('/api/v1/signup',async(req,res)=>{
    const {username,password,firstName,lastName} = req.body 
    try{
   const response =  await  userModel.create({
            username , 
            password ,
            firstName , 
            lastName
        }) ;   

        const user = response._id
        await accountModel.create({
            user,
            balance :1 +  Math.random() * 10000 
        })
        res.json({
            message:"you are signed up !!"
        })
    }catch(e){ 
        console.log(e)
        res.status(500).json({
            message:"coudn't signed up "
        })
    }
}) 

app.post('/api/v1/signin',async(req,res)=>{
    const {username , password} = req.body 
    try{
        const response = await userModel.findOne({
            username ,
            password
        })  
        if(response){
           const token =  jwt.sign({id:response._id},JWT_SECRET) 
           res.json({
            token : token
           })
        }
    }catch{
        res.json({
            message :"invalid credentials !!"
        })
    }
})


app.put('/api/v1/update',userMiddleware,async (req,res)=>{
    const {password,firstName,lastName}  = req.body 
  try{//@ts-ignore 
    //@ts-ignore
    await userModel.updateOne({_id:req.id},{
        password,
        firstName,
        lastName
    }) 
    res.json({
        message:"updated succesfully"
    })
    }catch{
        res.json({
            message : "updated unsuccesfully"
        })
    }
})


app.get('/api/v1/getUser',userMiddleware,async (req,res)=>{
    const filter = req.query.filter||"" 
      
    const user  = await userModel.find({
        $or:[{
            firstName:{
                "$regex" : filter
            } , 
            lastName:{
                "$regex" : filter
            }
        }]
    }) 
    res.json({
        users : user.map(user =>({
            username : user.username , 
            firstName : user.firstName , 
            lastName : user.firstName , 
            id : user._id
        }))
    })
})


app.get('/api/v1/getBalance',userMiddleware,async (req,res)=>{
    const response  = await accountModel.findOne({//@ts-ignore
        user:req.id     
    }) 
    res.json({
        balance  : response?.balance  
    }) 
})


app.post('/api/v1/transfer',userMiddleware,async(req,res)=>{
    
    const session = await mongoose.startSession()  

    session.startTransaction() 

    const {amount,to} = req.body 
    const myAccount =  await accountModel.findOne({
        //@ts-ignore
        user : req.id
    }).session(session) //@ts-ignore
    if(myAccount?.balance<amount){
          await session.abortTransaction()
        res.json({
            message : "insufficient balance !!"
        })
    }else{

    const toAccount = await accountModel.findOne({
        user:to 
    }).session(session)
//@ts-ignore
        await accountModel.updateOne({ user: req.id }, { $inc: { balance: -amount } }).session(session);
        await accountModel.updateOne({ user: to }, { $inc: { balance: amount } }).session(session); 
        await session.commitTransaction(); 
        res.json({
            message : "tranfer succesful !!!"
        })
    }

})
app.listen(3001,()=>{
    console.log("server is listening on port 3001")
})