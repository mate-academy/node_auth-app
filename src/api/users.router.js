'use strict';

const { Router } = require('express');
const { usersController } = require('./users.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const usersRouter = Router();

usersRouter.get('/', authMiddleware, usersController.getAll);

module.exports = { usersRouter };
