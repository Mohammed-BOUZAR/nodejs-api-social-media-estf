const router = require('express').Router({ mergeParams: true });
const { setSubComment, putSubComment, deleteSubComment, setSubCommentReaction, deleteSubCommentReaction } = require('../controllers/SubCommentControllers');
const { isSubcommentReactionAuth, isSubCommentAuth } = require('../middleware/auth');

/**
 * SubComments
 */

router.post("/", setSubComment);
router.put("/:subCommentId", isSubCommentAuth, putSubComment);
router.delete("/:subCommentId", isSubCommentAuth, deleteSubComment);

/**
 * Reactions
 */


router.post("/:subCommentId/reactions", setSubCommentReaction);
router.delete("/:subCommentId/reactions/:reactionId", isSubcommentReactionAuth, deleteSubCommentReaction);

module.exports = router;