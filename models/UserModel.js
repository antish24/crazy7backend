const mongoose=require('mongoose')

const UserSchema=mongoose.Schema({
    avatar:{type:String},
    userName:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    token:{type:String},
    gameCount:{type:Number,default:0},
    TotalGames:{type:Number,default:0},
    createAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
})


const User=mongoose.model('User',UserSchema)
module.exports=User