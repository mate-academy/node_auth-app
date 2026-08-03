const express = require('express');
const { userController } = require('../controller/userController.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const { catchError } = require('../utills/catchError.js');

const userRouter = express.Router();

userRouter.get(
  '/profile/:id',
  authMiddleware,
  catchError(userController.getMe),
);

userRouter.patch(
  '/update/:id',
  authMiddleware,
  catchError(userController.updateName),
);

module.exports = { userRouter };
