const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const { isAuth } = require('../middleware/auth');


/**
 * subComment Route
 */

router.get("/:subCommentId", isAuth, async (req, res) => {
  const { postId, commentId, subCommentId } = req.params;
  try {
    const post = Post.findOne(
      { _id: postId },
      { comments: { _id: commentId } }
    )
      .then((post) => {
        console.log("post: jjj: ")
        console.log(post);
        // if (!post) {
        //   return res.status(404).json({ message: "404 Post not found" });
        // }
        const comment = post.comments[0]; // get the first (and only) comment matching the _id

        const subComment = comment.sub_comments.find((sub) => sub._id.toString() === subCommentId);

        res.status(200).json(subComment);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: "Server error" });
      });


    return res.status(200).json(subComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.post("/", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const { content, userId } = req.body;
    const { postId, commentId } = req.params;

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $push: { 'comment.$[comment].sub_comments': { content, user: userId } } },
      {
        arrayFilters: [
          { 'comment._id': commentId }
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
    const post = await Post.findById(
      { '_id': postId },
      { $set: { 'comments.$[comment].sub_comments.$[subComment].content': content } },
      {
        arrayFilters: [
          { 'comment._id': commentId },
          { 'sub_comments._id': subCommentId }
        ],
        new: true
      }
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await post.save();
    return res.status(200).json({ message: "Subcomment updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.delete("/:subCommentId", isAuth, async (req, res) => {
  const { postId, commentId, subCommentId } = req.params;

  try {
    Post.findByIdAndUpdate(
      { '_id': postId },
      { $pull: { 'comments.$[comment].sub_comments': { _id: subCommentId } } },
      {
        arrayFilters: [
          { 'comment._id': commentId },
          // { 'subComment._id': subCommentId }
        ],
        new: true
      }
    )
      .then((post) => {
        if (!post)
          return res.status(404).json({ message: "404 Post not found!" });

        return res.status(200).json({ message: "SubComment deleted successfully" });
      }).catch((err) => {

      });;
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
//       'comment.$[comment].sub_comments': {
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