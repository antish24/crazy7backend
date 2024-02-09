const User = require("../models/UserModel");
const jwt = require ('jsonwebtoken');
const config = require ('../config/index');
const JWT_SECRET = config.JWT_SECRET;

exports.Middleware=async(req,res)=>{
    const {token} = req.body;
    try {
      if (!token) return res.status (401).json ({message: 'not token provided'});
      let user = jwt.verify (token, JWT_SECRET);
  
      const userinfo = await User.findById (user.userId);
      if (!userinfo || userinfo.token!==token) return res.status (401).json ({message: 'unauthorized'});
  
      res.status (200).json ({message:'good'});
    } catch (error) {
      res.status (500).json ({message: error.message});
    }
}
