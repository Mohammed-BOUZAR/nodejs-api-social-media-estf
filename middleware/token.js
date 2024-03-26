const { User } = require('../models/user');
const jwt = require("jsonwebtoken");

module.exports.isToken = async (req, res, next) => {
  // const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  // if (!token) return res.status(401).send({ message: 'Unauthorized' });
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //   req.userId = decoded.userId;
  //   const user = await User.findOne({ _id: req.userId });
  //   if (!user) return res.status(401).send({ message: 'Authentification required' });
  //   next();
  // } catch (err) {
  //   console.error(err);
  //   return res.status(500).send({ message: 'Server error' });
  // }



  // console.log(req.cookies.token);
  // const token = req.cookies.token;
  // console.log(token);
  // console.log("ok ok", token);
  // if (!token) return res.status(401).send({ message: 'Unauthorized' });
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //   req.userId = decoded.userId;
  //   const user = await User.findOne({ _id: req.userId });
  //   if (!user) return res.status(401).send({ message: 'Authentification required' });
  //   next();
  // } catch (err) {
  //   console.error(err);
  //   return res.status(500).send({ message: 'Server error' });
  // }


  const token = req.headers.authorization; // Get the token from the 'Authorization' header

  // Verify the token, perform authentication, and handle the request accordingly
  // Example: 
  if (token && token.startsWith('Bearer ')) {
    const accessToken = token.slice(7); 
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
      req.userId = decoded.userId;
      const user = await User.findOne({ _id: req.userId });
      if (!user) return res.status(401).send({ message: 'Authentication required' });
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: 'Server error' });
    }
  } else {
    // Token is missing or invalid, return an error response
    return res.status(401).json({ message: 'Unauthorized' });
  }
};