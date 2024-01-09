'use strict';

const express = require('express');
const { getAllUsers } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewars/authMiddleware');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, getAllUsers);

module.exports = {
  userRouter,
};
