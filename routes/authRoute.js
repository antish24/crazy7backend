const express=require('express')
const router=express.Router()
const AUthController=require('../controller/authController')


router.get('/data',AUthController.getData)
router.post('/register',AUthController.Register)
router.post('/login',AUthController.Login)
router.post('/logout',AUthController.Logout)
router.post('/update',AUthController.update)

module.exports=router

