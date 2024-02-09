const Player = require ('../models/PlayerModel');
const Card = require ('../models/CardModel');
const Game = require ('../models/GameModel');
const jwt = require ('jsonwebtoken');
const config = require ('../config/index');
const User = require ('../models/UserModel');
const Chat = require ('../models/Chat');
const JWT_SECRET = config.JWT_SECRET;

function generateGameCode () {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor (Math.random () * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

exports.createNew = async (req, res) => {
  const {token, roomName, playerSize} = req.body;
  try {
    if (!token) return res.status (401).json ({message: 'not token provided'});
    let userId = jwt.verify (token, JWT_SECRET);

    const user = await User.findById (userId.userId);
    if (!user || user.token !== token)
      return res.status (404).send ({message: 'User Not Found'});

    const cards = await Card.find ();
    let gameCode = generateGameCode ();

    const newPlayer = new Player ({userId: user._id, gameCode, role: 'host'});
    await newPlayer.save ();

    const newGame = new Game ({
      roomName,
      gameCode,
      gameStatus: 'Ready',
      playerSize,
      turn: newPlayer._id,
      draw: newPlayer._id,
      host: newPlayer._id,
      pileCards: cards,
      playersId: [newPlayer._id],
    });
    await newGame.save ();

    res.status (200).json ({gameCode});
  } catch (error) {
    // console.log(error)
    res.status (500).json ({error: error.message});
  }
};

exports.getGames = async (req, res) => {
  try {
    const game = await Game.find ({gameStatus: 'Ready'});
    const games = game.map (l => {
      return {
        _id: l._id,
        roomName: l.roomName,
        playerCount: l.playersId.length,
        gameCode: l.gameCode,
      };
    });
    res.status (200).json ({games: games});
  } catch (error) {
    res.status (500).json ({error: error.message});
  }
};

exports.joinGame = async (req, res) => {
  const {token, gameCode} = req.body;
  try {
    if (!token) return res.status (401).json ({message: 'not token provided'});
    let userId = jwt.verify (token, JWT_SECRET);

    const user = await User.findById (userId.userId);
    if (!user || user.token !== token)
      return res.status (404).send ({message: 'User Not Found'});

    const game = await Game.findOne ({gameCode: gameCode});
    if (!game||game.gameStatus!=='Ready') return res.status (404).json ({message: 'room not found'});

    const player = await Player.findOne ({
      userId: userId.userId,
      gameCode: gameCode,
    });

    if (!player) {
      const newPlayer = new Player ({
        userId: user._id,
        gameCode,
        role: 'guest',
      });
      await newPlayer.save ();
      game.playersId.push (newPlayer._id);
      await game.save ();
    }

    res.status (200).json ({gameCode});
  } catch (error) {
    res.status (500).json ({error: error.message});
  }
};

exports.players = async (req, res) => {
  const {gameCode, token} = req.body;
  try {
    if (!token) return res.status (401).json ({message: 'not token provided'});
    let userId = jwt.verify (token, JWT_SECRET);

    const user = await User.findById (userId.userId);
    if (!user || user.token !== token)
      return res.status (404).send ({message: 'User Not Found'});

    const game = await Game.findOne ({gameCode: gameCode});
    if (!game) return res.status (404).json ({message: 'no game'});

    const player = await Player.findOne ({
      userId: user._id,
      gameCode: gameCode,
    });
    const playerss = await Player.find ({
      gameCode: gameCode,
    }).populate ('userId', ['userName']);
    if (!playerss || !player)
      return res.status (404).json ({message: 'no players'});

    const gameStatus = game.gameStatus;
    const kick = game.host;
    const canKick = player._id;
    const playerSize = game.playerSize;
    const playerCount = game.playersId.length;
    const RoomName = game.roomName;

    const players = playerss.map (player => {
      return {
        _id: player._id,
        userName: player.userId.userName,
        role: player.role,
        kick: kick,
        canKick: player._id,
      };
    });

    res
      .status (200)
      .json ({players, kick, canKick, playerCount, playerSize, gameStatus,RoomName});
  } catch (error) {
    console.log (error);
    res.status (500).json ({error: error.message});
  }
};

exports.closeGame = async (req, res) => {
  const {gameCode, token} = req.body;

  try {
    if (!token) return res.status (401).json ({message: 'not token provided'});
    let userId = jwt.verify (token, JWT_SECRET);

    const user = await User.findById (userId.userId);
    if (!user || user.token !== token)
      return res.status (404).send ({message: 'User Not Found'});

    const game = await Game.findOne ({gameCode: gameCode});
    if (!game) return res.status (404).json ({message: 'no game'});

    await Game.deleteMany ({gameCode: gameCode});
    await Player.deleteMany ({gameCode: gameCode});

    res.status (200).json ({message: 'Game Closed'});
  } catch (error) {
    res.status (500).json ({error: error.message});
  }
};

exports.startGame = async (req, res) => {
  const {gameCode, token} = req.body;

  try {
    if (!token) return res.status (401).json ({message: 'not token provided'});
    let userId = jwt.verify (token, JWT_SECRET);

    const user = await User.findById (userId.userId);
    if (!user || user.token !== token)
      return res.status (404).send ({message: 'User Not Found'});

    const game = await Game.findOne ({gameCode: gameCode});
    if (!game||game.gameStatus!=='Ready') return res.status (404).json ({message: 'no game'});
    game.gameStatus='In Play'
    const players = await Player.find ({gameCode: gameCode});

    players.forEach (async player => {
      if (player.cards.length < 5) {
        const assignedCards = [];
        while (
          assignedCards.length < 5 - player.cards.length &&
          game.pileCards.length > 0
        ) {
          const randomIndex = Math.floor (
            Math.random () * game.pileCards.length
          );
          const randomCard = game.pileCards.splice (randomIndex, 1)[0];
          assignedCards.push (randomCard);
        }
        player.cards.push (...assignedCards);
        await player.save ();
      }
    });

    await game.save ();

    res.status (200).json ({message: 'Game started'});
  } catch (error) {
    console.log (error);
    res.status (500).json ({error: error.message});
  }
};

exports.gameData = async (req, res) => {
  const {gameCode, token} = req.body;
  try {
    if (!token) return res.status (401).json ({message: 'not token provided'});
    let userId = jwt.verify (token, JWT_SECRET);

    const user = await User.findById (userId.userId);
    if (!user || user.token !== token)
      return res.status (404).send ({message: 'User Not Found'});

    const game = await Game.findOne ({gameCode: gameCode})
    .populate ('pileCards', 'type value')
    .populate ('dropCards', 'type value')
    if (!game) return res.status (404).json ({message: 'no game'});

    const player = await Player.findOne ({
      userId: user._id,
      gameCode: gameCode,
    }).populate ('userId', ['userName'])
    .populate ('cards', 'type value')

    const players = await Player.find ({
      gameCode: gameCode,
    }).populate ('userId', ['userName'])
    .populate ('cards', 'type value')

    if (!players || !player)
      return res.status (404).json ({message: 'no players'});

    res
      .status (200)
      .json ({player,players,game});
  } catch (error) {
    console.log (error);
    res.status (500).json ({error: error.message});
  }
};
