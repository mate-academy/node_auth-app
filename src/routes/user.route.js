const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');
const catchError = require('../utils/catchError.js');
const userController = require('../controllers/user.controller.js');

const userRouter = express.Router();

userRouter.put(
  '/update-profile',
  authMiddleware,
  catchError(userController.updateProfile),
);

module.exports = { userRouter };
