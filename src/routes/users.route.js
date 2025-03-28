const userRouter = require('express').Router();
const userController = require('../controllers/users.controller.js');
const {
  authMiddleware,
} = require('../middlewares/authenticationMiddleware.js');
const { catchError } = require('../utils/catchError.js');

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

userRouter.patch(
  '/profile/name',
  authMiddleware,
  catchError(userController.updateUserName),
);

userRouter.patch(
  '/profile/email',
  authMiddleware,
  catchError(userController.updateUserEmail),
);

userRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(userController.updateUserPassword),
);

module.exports = userRouter;
