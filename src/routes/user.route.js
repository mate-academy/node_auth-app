const express = require('express');
const { getAllActivated } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.get('/', catchError(authMiddleware), catchError(getAllActivated));

module.exports = {
  userRouter,
};
