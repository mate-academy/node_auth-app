'use strict';

const express = require('express');

const { usersController } = require('./users.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const usersRouter = express.Router();

usersRouter.get('/', authMiddleware, usersController.getAll);

module.exports = { usersRouter };
