const Player = require ('../models/PlayerModel');
const Card = require ('../models/CardModel');
const Game = require ('../models/GameModel');
const jwt = require ('jsonwebtoken');
const config = require ('../config/index');
const User = require ('../models/UserModel');
const Chat = require ('../models/Chat');
const JWT_SECRET = config.JWT_SECRET;

async function changeTurn (gameCode, currentPlayerId) {
  try {
    const game = await Game.findOne ({gameCode: gameCode}).populate (
      'playersId'
    );

    const currentPlayerIndex = game.playersId.findIndex (
      player => player._id.toString () === currentPlayerId.toString ()
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.playersId.length;
    const nextPlayerId = game.playersId[nextPlayerIndex]._id;

    await Game.updateOne (
      {gameCode: gameCode},
      {
        turn: nextPlayerId,
        draw: nextPlayerId,
      }
    );
    console.log ('Draw player changed successfully.');
  } catch (error) {
    console.error ('Error changing draw player:', error);
  }
}

async function changeDraw (gameCode, currentPlayerId) {
  try {
    const game = await Game.findOne ({gameCode: gameCode}).populate (
      'playersId'
    );

    const currentPlayerIndex = game.playersId.findIndex (
      player => player._id.toString () === currentPlayerId.toString ()
    );
    console.log (currentPlayerIndex);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.playersId.length;
    const nextPlayerId = game.playersId[nextPlayerIndex]._id;
    console.log (nextPlayerIndex);
    console.log (nextPlayerId);

    await Game.updateOne (
      {gameCode: gameCode},
      {
        draw: nextPlayerId,
      }
    );
    console.log ('Draw player changed successfully.');
  } catch (error) {
    console.error ('Error changing draw player:', error);
  }
}

exports.DrawCard = async (req, res) => {
  const {playerId, cardId} = req.body;
  try {
    const playerExist = await Player.findOne ({_id: playerId});
    if (!playerExist) return res.status (401).json ({message: 'no player'});
    const isTurn = await Game.findOne ({gameCode: playerExist.gameCode});
    const turn = isTurn.turn.toString ();
    const draw = isTurn.draw.toString ();
    if (turn !== playerId || draw !== playerId)
      return res.status (401).json ({message: 'not your turn'});

    await Game.findOneAndUpdate (
      {gameCode: playerExist.gameCode},
      {
        $pull: {pileCards: cardId}, // Remove cardId from pileCards array
      }
    );

    await Player.findOneAndUpdate (
      {_id: playerId},
      {
        $push: {cards: cardId},
      }
    );

    await changeDraw (playerExist.gameCode, playerExist._id);
    res.status (200).json ({message: 'Draw'});
  } catch (error) {
    console.log (error);
    res.status (500).json ({message: error.message});
  }
};
exports.ChangeTurn = async (req, res) => {
  const {playerId} = req.body;
  try {
    const playerExist = await Player.findOne ({_id: playerId});
    if (!playerExist) return res.status (401).json ({message: 'no player'});
    const isTurn = await Game.findOne ({gameCode: playerExist.gameCode});
    const turn = isTurn.turn.toString ();
    const draw = isTurn.draw.toString ();
    if (turn !== playerId)return res.status (401).json ({message: 'not your turn'});
    if (draw === playerId)return res.status (401).json ({message: 'draw first'});

    await changeTurn (isTurn.gameCode, playerId); // Call the changeTurn function
    res.status (200).json ({message: 'change turn success'});
  } catch (error) {
    console.log (error);
  }
};

exports.DropCard = async (req, res) => {
  const {playerId, cardId} = req.body;
  try {
    const playerExist = await Player.findOne ({_id: playerId});
    if (!playerExist) return res.status (401).json ({message: 'no player'});
    const isTurn = await Game.findOne ({gameCode: playerExist.gameCode});
    const turn = isTurn.turn.toString ();
    if (turn !== playerId)
      return res.status (401).json ({message: 'not your turn'});

    await Game.findOneAndUpdate (
      {gameCode: playerExist.gameCode},
      {
        $push: {dropCards: cardId}, // add cardId to dropcards array
      }
    );

    await Player.findOneAndUpdate (
      {_id: playerId},
      {
        $pull: {cards: cardId},
      }
    );

    await changeTurn (playerExist.gameCode, playerExist._id);
    res.status (200).json ({message: 'Drop'});
  } catch (error) {
    console.log (error);
    res.status (500).json ({message: error.message});
  }
};

exports.getTurn = async (req, res) => {
  const {gameCode} = req.body;
  try {
    const game = await Game.findOne ({gameCode: gameCode})
    if (!game) return res.status (404).json ({message: 'no game'});
    const turn=game.turn
    res.status (200).json ({turn});
  } catch (error) {
    console.log (error);
    res.status (500).json ({error: error.message});
  }
};
