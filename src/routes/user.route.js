const express = require('express');
const { userController } = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.patch(
  '/update-name',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.patch(
  '/update-password',
  authMiddleware,
  catchError(userController.updatePassword),
);

module.exports = { userRouter };
