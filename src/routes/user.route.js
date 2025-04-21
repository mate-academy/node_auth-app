const { Router } = require('express');
const userController = require('../controllers/user.controller');
const authmiddleware = require('../middlewares/auth.middleware');

const userRouter = Router();

userRouter.get(
  '/profile',
  authmiddleware.protectedRouteHandler,
  userController.profilePage,
);

userRouter.patch(
  '/updateName',
  authmiddleware.protectedRouteHandler,
  userController.nameChange,
);

userRouter.patch(
  '/updateEmail',
  authmiddleware.protectedRouteHandler,
  userController.changeEmail,
);

userRouter.patch(
  '/updatePassword',
  authmiddleware.protectedRouteHandler,
  userController.changePassword,
);

module.exports = userRouter;
