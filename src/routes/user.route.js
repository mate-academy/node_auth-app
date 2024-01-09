'use strict';

const express = require('express');
const userController = require('../controllers/user.controller.js');

const userRouter = new express.Router();

userRouter.get('/', userController.getAllActivated);

module.exports = {
  userRouter,
};
