'use strict';

const express = require('express');

const UsersController = require('../users/users.controller');
const authMiddleware = require('../auth/middlewares/auth.middleware');

const UsersRouter = express.Router();

UsersRouter.get('/', authMiddleware, UsersController.getAll);
UsersRouter.get('/:id/user', UsersController.getOne);

module.exports = UsersRouter;
