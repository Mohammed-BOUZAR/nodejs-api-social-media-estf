module.exports.isAuth = (req, res, next) => {
  if (req.session.userId)
    return next();
  return res.status(400).json({message: "You are not authorized to perform this action"});
}