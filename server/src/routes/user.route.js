const { Router } = require('express');

const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new Router();

userRouter.get(
  '/users/:id',
  authMiddleware,
  catchError(userController.getById),
);

userRouter.patch(
  '/users/profile',
  authMiddleware,
  catchError(userController.update),
);

userRouter.patch(
  '/users/password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.patch(
  '/users/email',
  authMiddleware,
  catchError(userController.updateEmail),
);
userRouter.get('/users', authMiddleware, catchError(userController.getAll));

module.exports = { userRouter };
