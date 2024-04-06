const { Router } = require('express');
const { catchError } = require('../middlewars/catchErrorMiddleware.js');
const userController = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewars/authMiddleware.js');

const userRoute = Router();

userRoute.patch('/update', authMiddleware, catchError(userController.update));

module.exports = {
  userRoute,
};
