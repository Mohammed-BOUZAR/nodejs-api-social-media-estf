const { User } = require('../models/user');
const jwt = require("jsonwebtoken");

module.exports.isToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userId;
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(401).send({ message: 'Authentification required' })
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Server error' });
  }
};