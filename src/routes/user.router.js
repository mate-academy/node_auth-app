'use strict';

const express = require('express');

const {
  authMiddleware, catchError, rolePermissionMiddleware,
} = require('../libs/middlewares/middlewares.js');

const { UserController } = require('../controllers/user.controller.js');
const {
  userAccessService,
} = require('../services/user-access/user-access.js');
const {
  createValidation, updateValidation,
} = require('../libs/validation/user/validation.js');

const userRouter = new express.Router();

const userController = new UserController(userAccessService);

userRouter.use(catchError(authMiddleware));

userRouter.get(
  '/',
  catchError(userController.getAll.bind(userController))
);

userRouter.get(
  '/:id',
  catchError(userController.getById.bind(userController))
);

userRouter.post(
  '/',
  catchError(rolePermissionMiddleware),
  catchError(createValidation),
  catchError(userController.create.bind(userController))
);

userRouter.delete(
  '/:id',
  catchError(rolePermissionMiddleware),
  catchError(userController.remove.bind(userController))
);

userRouter.patch(
  '/:id',
  catchError(rolePermissionMiddleware),
  catchError(updateValidation),
  catchError(userController.update.bind(userController))
);

module.exports = {
  userRouter,
};
