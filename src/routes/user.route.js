const express = require('express');
const { getAllActive } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.get('/', catchError(authMiddleware), catchError(getAllActive));

module.exports = {
  userRouter,
};
