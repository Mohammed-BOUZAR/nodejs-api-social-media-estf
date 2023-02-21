const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const { isAuth } = require('../middleware/auth');


/**
 * subComment Route
 */

router.post("/", isAuth, async (req, res) => {
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

router.put("/:subCommentId", isAuth, async (req, res) => {
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


router.delete("/:subCommentId", isAuth, async (req, res) => {
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



// router.post("/:id/:commentId/:k/:f/:d", isAuth, async (req, res) => {
//   const { content } = req.body;
//   try {
//   let post = await Post.findByIdAndUpdate(
//   { '_id': req.params.id },
//   {
//     $push: {
//       'comment.$[comment].subComments': {
//         content,
//         user: req.session.userId
//       }
//     }
//   }, {
//   arrayFilters: [
//     { 'comment._id': req.params.commentId }
//   ],
//   new: true
// });

//   if (!post) {
//     return res.status(404).json({ error: "Post not found" });
//   }

//   return res.status(201).json(post);
// } catch (error) {
//   console.error(error);
//   return res.status(500).json({ error: "Server error" });
// }
// });

module.exports = router;