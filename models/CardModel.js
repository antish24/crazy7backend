const mongoose=require('mongoose')

const CardSchema=mongoose.Schema({
    type:{type:String,required:true},
    value:{type:String,required:true},
    createAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
})


const Card=mongoose.model('Card',CardSchema)
module.exports=Card