const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', authController.authValidation);
router.post('/signup', authController.sighUp);

router.post('/signin', authController.authValidation);
router.post('/signin', authController.signIn);

router.post('/password-reset', authController.getResetLink);

router.post('/logout', authMiddleware, authController.logOut);

router.get('/activate/:activationToken', authController.activate);

module.exports = { authRouter: router };
