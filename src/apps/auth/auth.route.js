const express = require('express');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.get('/activate/:email/:activationToken', authController.activate);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/password-reset', authController.passwordReset);

module.exports = router;
