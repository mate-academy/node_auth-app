'use strict';

const express = require('express');
const userController = require('../controllers/userController');
const userRouter = new express.Router();

userRouter.get('/', userController.getAll);

module.exports = { userRouter };
