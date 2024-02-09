const express=require('express')
const router=express.Router()
const chatController=require('../controller/chatController')


router.post('/post',chatController.newChat)
router.get('/chats',chatController.Chats)

module.exports=router

