const { Router } = require('express');
const { usersController } = require('../controllers/users.controller');
const authenticate = require('../middlewares/authenticate');

const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.getProfile);
usersRouter.put('/me/name', authenticate, usersController.updateName);
usersRouter.put('/me/password', authenticate, usersController.updatePassword);
usersRouter.put('/me/email', authenticate, usersController.updateEmail);

module.exports = {
  usersRouter,
};
