const { Post } = require('../models/post');
const { User } = require('../models/user');
const router = require('express').Router();
const comments = require('./comments');
const jwt = require('jsonwebtoken');
const { isToken } = require('../middleware/token');
const { isPostAuth, isReactionAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const uploadDir = `uploads/${year}/${month}/${day}/`;

    // Create the directory if it doesn't exist
    const dir = path.resolve(uploadDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cb(null, timestamp + extension); // set the filename to the current date and time with the original extension
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 75 * 1024 * 1024 }, // set the maximum file size to 75 MB

});

/**
 * Posts
 */

router.use('/:postId/comments', comments);

router.get("/", async (req, res) => {
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

router.get('/:postId', async (req, res) => {
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

router.get('/:postId/download/:year/:month/:day/:filename', async (req, res) => {
  const { postId, day, filename, month, year } = req.params;
  const file = path.join(__dirname, `../uploads/${year}/${month}/${day}`, filename);
  const post = await Post.findOne({ _id: postId });
  if(!post) return res.status(400).json({message: "Post Not exist"})
  const link = post.links.find(element => element.path == `${year}/${month}/${day}/${filename}`);
  if (!link) return res.status(400).json({ message: "File not exist" });
  res.download(file, link.name, (err) => {
    if (err) {
      return console.log(err);
    }
  });
});

router.post("/", upload.array('files'), async (req, res) => {
  const { content } = req.body;
  const files = [];

  req.files.forEach(element => {
    const str = element.path;
    const arr = str.split("/");
    const result = arr.slice(1).join("/");

    files.push({
      extname: path.extname(element.originalname), name: element.originalname, path: result
    });
  });

  try {
    let post = new Post({ content, links: files, user: req.userId });
    post = await post.save();
    await User.findByIdAndUpdate(req.userId, { $push: { 'posts': post._id } }, { new: true });
    res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put('/:postId', isPostAuth, async (req, res) => {
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

router.delete("/:postId", isPostAuth, async (req, res) => {
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


// handle errors caused by file size limit
// router.use(function (err, req, res, next) {
//   if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
//     res.status(400).send({ message: 'File too large' });
//   } else {
//     next(err);
//   }
// });


/**
 * Reactions
 */

router.post("/:postId/reactions", async (req, res) => {
  const { type } = req.body;
  const { postId } = req.params;
  try {
    let post = await Post.findOne({ _id: postId });
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.reactions.find(reaction => reaction.user == req.userId)) {
      return res.status(400).json({ error: "User has already reacted to this post" });
    }
    post.reactions.push({ type, user: req.userId });
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// router.put("/:postId/reactions/:reactionId", isReactionAuth, async (req, res) => {
//   const { type } = req.body;
//   const { postId, reactionId } = req.params;
//   try {
//     let updatedComment = await Post.findOneAndUpdate(
//       { _id: postId, "reactions.user": { $eq: req.userId } }, // Check if "id" value doesn't exist in the reactions array
//       { $set: { "reactions.$[reactions].type": type } },
//       { new: true, arrayFilters: [{ "reactions._id": reactionId }] }
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

router.delete("/:postId/reactions/:reactionId", isReactionAuth, async (req, res) => {
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