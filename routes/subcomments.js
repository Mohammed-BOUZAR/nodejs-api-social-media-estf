const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const { isToken } = require('../middleware/token');
const { isSubCommentAuth, isSubcommentReactionAuth } = require('../middleware/auth');


/**
 * SubComments
 */

router.post("/", isToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const { content, userId } = req.body;
    const { postId, commentId } = req.params;

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $push: { 'comments.$[comments].subComments': { content, user: userId } } },
      {
        arrayFilters: [
          { 'comments._id': commentId }
        ],
        new: true
      }
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:subCommentId", isToken, isSubCommentAuth, async (req, res) => {
  const { postId, commentId, subCommentId } = req.params;
  const { content } = req.body;
  try {
    const post = await Post.findOneAndUpdate(
      { '_id': postId },
      { $set: { 'comments.$[comments].subComments.$[subComments].content': content } },
      {
        arrayFilters: [
          { 'comments._id': commentId },
          { 'subComments._id': subCommentId }
        ],
        new: true
      }
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await post.save();
    return res.status(200).json({ message: "SubComment updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:subCommentId", isToken, isSubCommentAuth, async (req, res) => {
  const { postId, commentId, subCommentId } = req.params;

  try {
    const post = await Post.findByIdAndUpdate(
      { '_id': postId },
      { $pull: { 'comments.$[comment].subComments': { _id: subCommentId } } },
      {
        arrayFilters: [
          { 'comment._id': commentId }
        ],
        new: true
      }
    );

    return res.status(200).json({ message: "SubComment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Reactions
 */


router.post("/:subCommentId/reactions", isToken, async (req, res) => {
  const { type } = req.body;
  const { postId, commentId, subCommentId } = req.params;
  try {
    let post = await Post.findOne({ _id: postId });
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    const subcomment = comment.subComments.id(subCommentId);
    if (!subcomment) return res.status(404).json({ error: "SubComment not found" });
    if (subcomment.reactions.find(element => element.user == req.userId)) {
      return res.status(400).json({ error: "User has already reacted to this SubComment" });
    }
    subcomment.reactions.push({ type, user: req.userId });
    await post.save();
    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// router.put("/:subCommentId/reactions/:reactionId", isToken, isSubcommentReactionAuth, async (req, res) => {
//   const { type } = req.body;
//   const { postId, commentId, subCommentId, reactionId } = req.params;
//   try {
//     let updatedComment = await Post.findByIdAndUpdate(
//       {
//         _id: postId,
//         "comments._id": commentId,
//         "comments.$[comments].subComments.$[subComment].reactions._id": { $eq: req.userId } // Check if "id" value doesn't exist in the reactions array
//       },
//       { $set: { "comments.$[comment].subComments.$[subComment].reactions.$[reaction].type": type } },
//       {
//         new: true,
//         arrayFilters: [
//           { "comment._id": commentId },
//           { "subComment._id": subCommentId },
//           { "reaction._id": reactionId }
//         ]
//       }
//     );

//     if (!updatedComment) {
//       return res.status(404).json({ error: "Comment not found" });
//     }

//     return res.status(200).json(updatedComment);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

router.delete("/:subCommentId/reactions/:reactionId", isToken, isSubcommentReactionAuth, async (req, res) => {
  const { postId, commentId, subCommentId, reactionId } = req.params;
  try {
    let post = await Post.findOneAndUpdate(
      {
        _id: postId,
        "comments._id": commentId,
        "comments.$[comments].subComments.$[subComments].reactions._id": { $eq: req.userId } // Check if "id" value doesn't exist in the reactions array
      },
      { $pull: { "comments.$[comments].subComments.$[subComments].reactions": { _id: reactionId } } },
      {
        new: true, arrayFilters: [
          { "comments._id": commentId },
          { "subComments._id": subCommentId }
        ]
      }
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