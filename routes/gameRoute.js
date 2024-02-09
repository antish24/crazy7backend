const express=require('express')
const router=express.Router()
const GameController=require('../controller/gameController')
const PlayingController=require('../controller/PlayingController')

router.post('/create',GameController.createNew)
router.post('/join',GameController.joinGame)
router.get('/all',GameController.getGames)

router.post('/close',GameController.closeGame)
router.post('/players',GameController.players)
router.post('/gamedata',GameController.gameData)
router.post('/start',GameController.startGame)

// router.post('/kick',GameController.kickPlayer)

router.post('/draw',PlayingController.DrawCard)
router.post('/turn',PlayingController.getTurn)
router.post('/drop',PlayingController.DropCard)
router.post('/changeturn',PlayingController.ChangeTurn)

module.exports=router

