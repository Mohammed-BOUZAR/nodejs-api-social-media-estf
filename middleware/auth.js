const { default: mongoose } = require('mongoose');
const { Post } = require('../models/post');
const { User } = require('../models/user');

module.exports.isPostAuth = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).select('user');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (String(post.user) != String(req.userId)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports.isCommentAuth = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (String(comment.user) !== String(req.userId)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports.isSubCommentAuth = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const subComment = comment.subComments.id(req.params.subCommentId);
    if (!subComment) {
      return res.status(404).json({ message: 'SubComment not found' });
    }
    if (String(subComment.user) !== String(req.userId) && String(post.user) !== String(req.userId)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports.isReactionAuth = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (String(post.user) === String(req.userId)) {
      return res.status(401).json({ message: 'Not authorized to react on your own post' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports.isCommentReactionAuth = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (String(comment.user) === String(req.userId)) {
      return res.status(401).json({ message: 'Not authorized to react on your own comment' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports.isSubcommentReactionAuth = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const subcomment = comment.subcomments.id(req.params.subcommentId);
    if (!subcomment) {
      return res.status(404).json({ message: 'Subcomment not found' });
    }
    if (String(subcomment.user) === String(req.userId)) {
      return res.status(401).json({ message: 'Not authorized to react on your own subcomment' });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
