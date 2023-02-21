const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router();
const comments = require('./comments');
const jwt = require('jsonwebtoken');
const { isAuth } = require('../middleware/auth');

router.use('/:postId/comments', comments);

router.get("/", isAuth, async (req, res) => {
  try {
    console.log("userId: ")
    console.log(req.userId)
    // const token = req.cookies.token;
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const posts = await Post.find({ user: req.userId });

    if (!posts || posts.length === 0) {
      return res.status(200).json({ message: "No posts found" });
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get('/:postId', isAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).send({ message: 'Authentication required' });
    }
    const userId = req.userId;
    const post = await Post.findOne({ _id: req.params.postId, user: userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post("/", isAuth, async (req, res) => {
  const { content } = req.body;
  try {
    let post = new Post({
      content,
      user: req.userId
    });
    post = await post.save();

    await User.findByIdAndUpdate(req.userId, {
      $push: {
        'posts': post._id
      }
    }, { new: true });

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});



router.put('/:postId', isAuth, async (req, res) => {
  const { content } = req.body;
  try {
    let updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete("/:postId", isAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const deletedPost = await Post.findByIdAndDelete(req.params.postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: {
        'posts': deletedPost._id
      }
    }, { new: true });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;