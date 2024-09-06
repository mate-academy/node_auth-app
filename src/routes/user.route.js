const express = require('express');
const { getAllActivated } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(getAllActivated));

module.exports = {
  userRouter,
};
