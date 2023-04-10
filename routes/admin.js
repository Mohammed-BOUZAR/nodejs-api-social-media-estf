const { addUserAdmin, getUsers, getUser, getPosts, getConversations, getConversation, putUser, putPost, deleteUser, deletePost, deleteConversation, deleteComment, deleteSubComment, getPost } = require('../controllers/AdminControllers');
const router = require('express').Router();

router.post('/', addUserAdmin);

router.get('/users', getUsers);
router.get('/users/:userId', getUser);
// router.get('/users/:userId/posts', getPosts);
router.get('/users/:userId/posts/:postId', getPost);
router.get('/users/:userId/conversations', getConversations);
router.get('/users/:userId/conversations/:conversationId', getConversation);

router.put('/users/:userId', putUser);
router.put('/users/:userId/posts/:postId', putPost);

router.delete('/users/:userId', deleteUser);
router.delete('/users/:userId/posts/:postId', deletePost);
router.delete('/users/:userId/conversations/:id', deleteConversation);
router.delete('/users/:userId/posts/:postId/comments/:commentId', deleteComment);
router.delete('/users/:userId/posts/:postId/comments/:commentId/subcomments/:subCommentId', deleteSubComment);


module.exports = router;