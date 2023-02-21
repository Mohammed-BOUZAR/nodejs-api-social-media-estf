const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router({ mergeParams: true });
const subcomments = require('./subcomments')
const jwt = require('jsonwebtoken');
const { isAuth } = require('../middleware/auth');


/**
 * Comments
 */

router.use('/:commentId/subComments', subcomments);

router.get("/:commentId", isAuth, async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    return res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", isAuth, async (req, res) => {
  const { content, userId } = req.body;
  try {
    let post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $push: { 'comments': { content, user: userId } } },
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

router.put("/:commentId", isAuth, async (req, res) => {
  const { content } = req.body;
  try {
    let updatedComment = await Post.findOneAndUpdate(
      { "_id": req.params.postId, "comments._id": req.params.commentId },
      { $set: { "comments.$[comments].content": content } },
      { new: true, arrayFilters: [{ "comments._id": req.params.commentId }] }
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

router.delete("/:commentId", isAuth, async (req, res) => {
  try {
    let post = await Post.findOneAndUpdate(
      { "_id": req.params.postId },
      { $pull: { "comments": { "_id": req.params.commentId } } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});



/**
 * Reactions
 */

router.post("/:commentId/reactions", isAuth, async (req, res) => {
  const { type } = req.body;
  const { postId, commentId } = req.params;
  try {
    let post = await Post.findByIdAndUpdate(
      {
        _id: postId,
        "comments._id": commentId,
        "comments.$[comments].reactions._id": { $ne: req.userId } // Check if "id" value doesn't exist in the reactions array
      },
      { $push: { "comments.$[comment].reactions": { type, _id: req.userId } } },
      { new: true, arrayFilters: [{ "comment._id": commentId }] }
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

router.put("/:commentId/reactions/:reactionId", isAuth, async (req, res) => {
  const { type } = req.body;
  const { postId, reactionId } = req.params;
  try {
    let updatedComment = await Post.findByIdAndUpdate(
      {
        _id: postId,
        "comments._id": commentId,
        "comments.$[comments].reactions._id": { $eq: req.userId } // Check if "id" value doesn't exist in the reactions array
      },
      { $set: { "comments.$[comment].reactions.$[reaction].type": type } },
      { new: true, arrayFilters: [{ "comment._id": commentId }, { "reaction._id": reactionId }] }
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

router.delete("/:commentId/reactions/:reactionId", isAuth, async (req, res) => {
  const { postId, reactionId } = req.params;
  try {
    let post = await Post.findOneAndUpdate(
      {
        _id: postId,
        "comments._id": commentId,
        "comments.$[comments].reactions._id": { $eq: req.userId } // Check if "id" value doesn't exist in the reactions array
      },
      { $pull: { "comments.$[comment].reactions": { _id: reactionId } } },
      { new: true, arrayFilters: [{ "comment._id": commentId }] }
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


module.exports = router