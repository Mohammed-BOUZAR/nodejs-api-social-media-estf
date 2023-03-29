const router = require('express').Router();
const { getPosts, getPost, setPost, putPost, deletePost, setPostReaction, deletePostReaction, downloadPostFile } = require('../controllers/PostControllers');
const { isPostAuth, isReactionAuth } = require('../middleware/auth');
const comments = require('./comments');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const uploadDir = `public/post_files/${year}/${month}/${day}/`;

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

router.get("/", getPosts);
router.get('/:postId', getPost);
router.post("/", upload.array('files'), setPost);
router.put('/:postId', isPostAuth, putPost);
router.delete("/:postId", isPostAuth, deletePost);


/**
 * Reactions
 */

router.post("/:postId/reactions", setPostReaction);
router.delete("/:postId/reactions/:reactionId", isReactionAuth, deletePostReaction);

/**
 * Download Post Files
 */

router.get('/post_files/:year/:month/:day/:filename', downloadPostFile);

module.exports = router;