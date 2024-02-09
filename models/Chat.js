const mongoose=require('mongoose')

const ChatSchema=mongoose.Schema({
    playerId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    gameCode:{type:String,required:true},
    msg:{type:String,required:true},
    createAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
})


const Chat=mongoose.model('Chat',ChatSchema)
module.exports=Chat