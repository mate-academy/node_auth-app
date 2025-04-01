const express = require('express');
const { getAllActivated } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../config/catchError');

const userRouter = new express.Router();

userRouter.get('/', catchError(authMiddleware), catchError(getAllActivated));

module.exports = {
  userRouter,
};
