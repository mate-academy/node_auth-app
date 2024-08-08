const express = require('express');
const {
  getAllActivated,
  updateName,
  updateEmail,
  updatePassword,
} = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const userRouter = express.Router();

userRouter.get('/', authMiddleware, catchError(getAllActivated));
userRouter.patch('/profile/name', authMiddleware, catchError(updateName));
userRouter.patch('/profile/email', authMiddleware, catchError(updateEmail));

userRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(updatePassword),
);

module.exports = userRouter;
