const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router();

router.get("/", async (req, res) => {
  req.session.userId = "63ee1308457b055a233f4b85";
  console.log("get posts: ", req.session.userId)

  const posts = await Post.find({ user: { _id: req.session.userId } });
  if (!posts)
    return res.status(200).json({ message: "No Posts1" });
  console.log(posts);
  return res.status(200).json({ posts });
});

router.get("/:id", async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    "user._id": req.session.userId
  });
  if (!post)
    return res.status(404).json({ message: "Not found!" });
  return res.status(200).json({ post });
});

router.post("/", async (req, res) => {
  const { content } = req.body;
  let post = new Post({
    content,
    user: req.session.userId
  });
  post.save();

  await User.findByIdAndUpdate(req.session.userId, {
    $push: {
      'posts': post._id
    }
  }, { new: true });
  return res.status(201).json(post);
});

router.post("/:id", async (req, res) => {
  const { content, comment } = req.body;
  let post = await Post.findByIdAndUpdate(req.params.id, {
    $push: {
      'comment': {
        content,
        user: req.session.userId
      }
    }
  }, {
    new: true
  });

  return res.status(201).json(post);
});

router.post("/:id/:id_comment", async (req, res) => {
  const { content } = req.body;
  let post = await Post.findByIdAndUpdate(req.params.id, {
    $push: {
      'comment.$[comment].sub_comment': {
        content,
        user: req.session.userId
      }
    }
  }, {
    arrayFilters: [
      { 'comment._id': req.params.id_comment }
    ],
    new: true
  });

  return res.status(201).json(post);
});

router.put("/:id", async (req, res) => {
  // const post = await Post.findById()
});

router.delete("/:id", (req, res) => {

});

module.exports = router;