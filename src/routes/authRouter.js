'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:activationToken', authController.activate);
authRouter.post('/login', authController.login);

module.exports = authRouter;
