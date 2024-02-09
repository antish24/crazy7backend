const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const config = require ('../config/index');
const User = require ('../models/UserModel');
const JWT_SECRET = config.JWT_SECRET;

exports.getData = async (req, res) => {
    const token = req.query.token;
    try {
      if (!token) return res.status (401).json ({message: 'not token provided'});
      let user = jwt.verify (token, JWT_SECRET);
  
      const userinfo = await User.findById (user.userId);
      if (!userinfo || userinfo.token!==token) return res.status (401).json ({auth: false});
  
      const userData = {
        _id: userinfo._id,
        pic: userinfo.avatar,
        name: userinfo.userName,
        email: userinfo.email,
      };
  
      res.status (200).json ({userData});
    } catch (error) {
      res.status (500).json ({message: error.message});
    }
};

exports.update = async (req, res) => {
    const {token,userName,email,password} = req.body;
    try {
      if (!token) return res.status (401).json ({message: 'not token provided'});
      let user = jwt.verify (token, JWT_SECRET);

      const userinfo = await User.findById (user.userId);
      if (!userinfo || userinfo.token!==token) return res.status (401).json ({auth: false});

      const userExist = await User.findOne ({email: email,_id:{$ne:userinfo._id}});
      if(userExist) return res.status (401).json ({message: 'Email Taken'});

      if(password!==''){
        let hashPassword = await bcrypt.hash (password, 10);
        await User.findByIdAndUpdate(
            userinfo._id,{
                userName:userName,
                email:email,
                password:hashPassword
            }
          )
    }
    else{
        await User.findByIdAndUpdate(
            userinfo._id,{
                userName:userName,
                email:email,
            }
          )
    }
  
      res.status (200).json ({message:'Updated'});
    } catch (error) {
      res.status (500).json ({message: error.message});
    }
};

exports.Register = async (req, res) => {
    const {userName,email, password} = req.body;
    try {
      const userExist = await User.findOne ({email: email});
      if (userExist) return res.status (401).json ({message: 'Email Taken'});
  
      const hashPassword = await bcrypt.hash (password, 10);
      let newUser = new User ({userName, email, password: hashPassword,avatar:""});
      await newUser.save ();
      res.status (200).send ({message: 'Account Created Successfully'});
    } catch (error) {
      res.status (500).json ({message: error.message});
    }
  };

exports.Login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const userExist = await User.findOne ({email: email});
    if (!userExist) return res.status (401).json ({message: 'User not Found'});

    const isValidPass = await bcrypt.compare (password, userExist.password);
    if (!isValidPass) return res.status (401).json ({message: 'Incorrect Password'});

    const payload = {userId: userExist._id}; // Customize the payload as needed
    const options = {expiresIn: '5h'};
    const token = jwt.sign (payload, JWT_SECRET, options);
    userExist.token = token;
    await userExist.save ();
    res.status (201).send ({message: 'Logged In Successfully', token});
  } catch (error) {
    res.status (500).json ({message: error.message});
  }
};

exports.Logout = async (req, res) => {
    const {token} = req.body;
    try {
        if (!token) return res.status (401).json ({message: 'not token provided'});
        let user = jwt.verify (token, JWT_SECRET);
    
        const userinfo = await User.findById (user.userId);
        if (!userinfo || userinfo.token!==token) return res.status (401).json ({message: 'unauth'});

        userinfo.token=''
        userinfo.updatedAt=Date.now()

        await userinfo.save()
        res.status (200).json ({message: 'Logout Success'});
      } catch (error) {
        res.status (500).json ({message: error.message});
        console.log (error);
      }
  };
  