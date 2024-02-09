const mongoose=require('mongoose')

const GameSchema=mongoose.Schema({
    gameCode:{type:String,required:true,unique: true},
    roomName:{type:String,required:true},
    gameStatus:{type:String,},
    playerSize:{type:Number,required:true},
    turn:{type:mongoose.Schema.ObjectId,ref:"Player",required:true},
    draw:{type:mongoose.Schema.ObjectId,ref:"Player",required:true},
    host:{type:mongoose.Schema.ObjectId,ref:"Player",required:true},
    playersId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required:true
          },
    ],
    pileCards:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Card',
          },
    ],
    dropCards:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Card',
          },
    ],
    createAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
})


const Game=mongoose.model('Game',GameSchema)
module.exports=Game