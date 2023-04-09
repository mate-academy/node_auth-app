'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const authRouter = new express.Router();

authRouter.post('/registration', authController.register);

module.exports = authRouter;
