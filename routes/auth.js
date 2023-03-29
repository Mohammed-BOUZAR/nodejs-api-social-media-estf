const router = require('express').Router();
const { authRegister, authLogin, authLogout } = require("../controllers/AuthControllers");

/**
 * Auth
 */

router.post("/register", authRegister);
router.post('/login', authLogin);
router.post('/logout', authLogout);


module.exports = router;


/**
 * {
     "first_name": "Hhhhh",
    "last_name": "Hhhhh",
    "date_birth": "2002-03-09",
    "email": "hhh@hhh.hhh",
    "password": "12345",
    "state": "en attente",
    "cin": "CC231",
    "cne": "EE221"
}
 */