'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:email/:token', authController.activation);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

module.exports = { authRouter };
