const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router();
const comments = require('./comments');
const jwt = require('jsonwebtoken');
const { isToken } = require('../middleware/token');
const { isPostAuth, isReactionAuth } = require('../middleware/auth');


/**
 * Posts
 */

router.use('/:postId/comments', comments);

router.get("/", isToken, async (req, res) => {
  try {
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

router.get('/:postId', isToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).send({ message: 'Authentication required' });
    }

    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post("/", isToken, async (req, res) => {
  const { content } = req.body;
  console.log(req.userId);
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

    res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put('/:postId', isToken, isPostAuth, async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  try {
    let updatedPost = await Post.findByIdAndUpdate(
      { _id: postId, user: req.userId },
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

router.delete("/:postId", isToken, isPostAuth, async (req, res) => {
  const { postId } = req.params;
  try {
    const userId = req.userId;

    const deletedPost = await Post.findByIdAndDelete({ _id: postId, user: req.userId });

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


/**
 * Reactions
 */

router.post("/:postId/reactions", isToken, async (req, res) => {
  const { type } = req.body;
  const { postId } = req.params;
  try {
    let post = await Post.findByIdAndUpdate(
      { _id: postId, "reactions.user": { $ne: req.userId } }, // Check if "id" value doesn't exist in the reactions array
      { $push: { 'reactions': { type, user: req.userId } } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:postId/reactions/:reactionId", isToken, isReactionAuth, async (req, res) => {
  const { type } = req.body;
  const { postId, reactionId } = req.params;
  try {
    let updatedComment = await Post.findOneAndUpdate(
      { _id: postId, "reactions.user": { $eq: req.userId } }, // Check if "id" value doesn't exist in the reactions array
      { $set: { "reactions.$[reactions].type": type } },
      { new: true, arrayFilters: [{ "reactions._id": reactionId }] }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:postId/reactions/:reactionId", isToken, isReactionAuth, async (req, res) => {
  const { postId, reactionId } = req.params;
  try {
    let post = await Post.findOneAndUpdate(
      { _id: postId, "reactions.user": { $eq: req.userId } },
      { $pull: { "reactions": { _id: reactionId } } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ message: "Reaction deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;