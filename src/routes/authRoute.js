const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// create user
router.post(
    '/signUp',
    // Validation
    body('email').isEmail(),
    body('name').isString(),
    body('doB').isString(),
    body('password').isLength({ min: 8 }).matches(/\d/), // min 8 must have number
    authController.signup
);

// login
router.post(
    '/login',
    authController.login
);

// forgot password
router.patch(
    '/forgot-password',
    authController.forgotPassword
);

// reset password
router.patch(
    '/reset-password/:token',
    authController.resetPassword
);


module.exports = router;