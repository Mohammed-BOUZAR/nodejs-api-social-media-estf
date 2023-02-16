const { User } = require('../models/user');
const router = require('express').Router();
const bcrypt = require('bcryptjs');

router.post("/register", async (req, res) => {
  let { nom, prenom, email, password } = req.body;
  if (!nom || !prenom || !email || !password)
    return res.json({ message: "nom, prenom, email & password are required" });

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  const user = new User({ nom, prenom, email, password });
  user.save();
  // req.session.userId = user._id;
  console.log(user);
  res.status(201).json(user);
});

router.post("/login/:id", async (req, res) => {
  // const { email, password } = req.body;
  // if (!email || !password)
  //   return res.status(400).json({ message: "email & password are required" });
  

  // const user = await User.findOne({ email });
  // console.log(user);
  // if (!user)
  //   return res.status(400).json({ message: "This user not found!" });

  // const isMatch = bcrypt.compareSync(password, user.password);
  // console.log(isMatch);
  // if (!isMatch)
  //   return res.status(400).json({ message: "Password is incorrect!" });

  // req.session.userId = user._id;
  req.session.userId = req.params.id;
  res.status(200).json({ message: "Connected!" });
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "logged out !" });
});

module.exports = router;