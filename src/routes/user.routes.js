const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleWare } = require('../middlewares/auth.middleware.js');
const { catchError } = require('../middlewares/validate.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleWare, catchError(userController.getAllActivated));

module.exports = { userRouter };
