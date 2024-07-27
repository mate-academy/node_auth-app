const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware.js');
const { usersController } = require('../controllers/users.controller');

const usersRouter = Router();

usersRouter.get('/', authMiddleware, usersController.getAll);

module.exports = {
  usersRouter,
};
