const router = require('express').Router({ mergeParams: true });
const { setCommentReaction, deleteCommentReaction, getComment, setComment, putComment, deleteComment, getComments } = require('../controllers/CommentControllers');
const { isCommentAuth, isCommentReactionAuth } = require('../middleware/auth');
const subcomments = require('./subcomments');

/**
 * Comments
 */

router.use('/:commentId/subcomments', subcomments);

router.get("/", getComments);
router.get("/:commentId", getComment);
router.post("/", setComment);
router.put("/:commentId", isCommentAuth, putComment);
router.delete("/:commentId", isCommentAuth, deleteComment);

/**
 * Reactions
 */

router.post("/:commentId/reactions", setCommentReaction);
router.delete("/:commentId/reactions/:reactionId", isCommentReactionAuth, deleteCommentReaction);


module.exports = router;