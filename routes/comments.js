const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router({ mergeParams: true });
const subcomments = require('./subcomments')
const jwt = require('jsonwebtoken');
const { isAuth } = require('../middleware/auth');


/**
 * Comment Route
 */

router.use('/:commentId/subComments', subcomments);

router.get("/:commentId", isAuth, async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = post.comment.id(commentId);
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
      { $push: { 'comment': { content, user: userId } } },
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
    console.log("put comment")
    let updatedComment = await Post.findOneAndUpdate(
      { "_id": req.params.postId, "comment._id": req.params.commentId },
      { $set: { "comment.$[comment].content": content } },
      { new: true, arrayFilters: [{ "comment._id": req.params.commentId }] }
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
    let updatedPost = await Post.findOneAndUpdate(
      { "_id": req.params.postId },
      { $pull: { "comment": { "_id": req.params.commentId } } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router