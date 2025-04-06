import mongoose, { model, Schema } from "mongoose";  
import { BACKEND_URL } from "./utils";


mongoose.connect(BACKEND_URL)


const userShema   = new Schema({
    username : {
        required: true , 
        minLength : 3 , 
        maxlenght : 30 , 
        type : String  , 
        unique : true
    }, 
    password:{
        required: true , 
        minLength : 6 , 
        type : String 
    } , 
  firstName : {
    required : true , 
    type : String , 
    maxLenght : 50 
  },
  lastName : {
    required : true , 
    type : String , 
    maxLenght : 50 
  },
}) 


const accountSchema = new Schema({
  balance  : {
    required : true  , 
    type  :Number 
  }  , 
  user  : {
    ref : "users" , 
    required : true , 
    type : mongoose.Types.ObjectId
  }
})


export  const userModel = model("userS" , userShema) 
export const accountModel = model("accountMOdel",accountSchema)  