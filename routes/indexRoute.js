const express = require("express");
const router=express.Router()

const Game=require('./gameRoute')
const Auth=require('./authRoute')
const Chat=require('./chatRoute')

router.use('/game',Game)
router.use('/user',Auth)
router.use('/chat',Chat)

module.exports=router
