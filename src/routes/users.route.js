const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');
const { usersController } = require('../controllers/users.controller');

const usersRouter = new express.Router();

usersRouter.get(
  '/',
  authMiddleware,
  catchError(usersController.getAllActivated),
);

module.exports = { usersRouter };
