const router = require('express').Router();
const { getUsers, getUser, putUser, deleteUser } = require("../controllers/UserControllers");

/**
 * Users
 */

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', putUser);
router.delete('/:id', deleteUser);

module.exports = router;