const jwt = require ('jsonwebtoken');
const config = require ('../config/index');
const User = require ('../models/UserModel');
const Chat = require ('../models/Chat');
const Player = require('../models/PlayerModel');
const JWT_SECRET = config.JWT_SECRET;

exports.newChat = async (req, res) => {
    const {token,msg,gameCode} = req.body;
    try {
      if (!token) return res.status (401).json ({message: 'not token provided'});
      let user = jwt.verify (token, JWT_SECRET);
  
      const userinfo = await User.findById (user.userId);
      if (!userinfo || userinfo.token!==token) return res.status (401).json ({auth: false});

      const player=await Player.findOne({userId:userinfo._id})
      if (!player ) return res.status (401).json({message: 'Kicked Out'});

      let newchat = new Chat ({playerId:user.userId,gameCode:gameCode, msg:msg});
      await newchat.save ();
      res.status (200).json ({message:"msg sent",newchat});
    } catch (error) {
      res.status (500).json ({message: error.message});
      console.log (error);
    }
};


function formatRelativeTime(date) {
  const now = new Date();
  const diffInMilliseconds = now - date;

  // Format the time as "today 8:43 PM"
  if (diffInMilliseconds < 24 * 60 * 60 * 1000) {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return `today ${date.toLocaleString('en-US', options)}`;
  }

  // Format as "1 day ago", "2 days ago", etc.
  if (diffInMilliseconds < 2 * 24 * 60 * 60 * 1000) {
    return '1 day ago';
  }

  // Format as normal date and time
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleString('en-US', options);
}

exports.Chats = async (req, res) => {
    const token = req.query.token;
    const gameCode = req.query.gameCode;
    try {
      if (!token) return res.status (401).json ({message: 'not token provided'});
      let user = jwt.verify (token, JWT_SECRET);
  
      const userinfo = await User.findById (user.userId);
      if (!userinfo || userinfo.token!==token) return res.status (401).json ({auth: false});

      const player=await Player.findOne({userId:userinfo._id})
      if (!player ) return res.status (401).json({message: 'Kicked Out Player'});

      const chatData = await Chat.find({gameCode:gameCode})
      .sort({ createAt: -1 })
      .populate('playerId', 'userName')
      .exec()

      const chats = chatData.map((p) => ({
        userName: p.playerId.userName,
        _id:p._id,
        msg: p.msg,
        time:formatRelativeTime(p.createAt),
      }));
  
      res.status (200).json ({chats});
    } catch (error) {
      res.status (500).json ({message: error.message});
      console.log (error);
    }
};