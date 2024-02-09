const mongoose=require('mongoose')

const PlayerSchema=mongoose.Schema({
    cards:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Card',
            required:true
          },
    ],
    userId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    gameCode:{type:String},
    role:{type:String},
    createAt: { type: Date,default: Date.now },
    updatedAt: { type: Date, default: null },
})


const Player=mongoose.model('Player',PlayerSchema)
module.exports=Player