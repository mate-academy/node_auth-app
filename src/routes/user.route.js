const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleWare } = require('../middlewares/authMiddleWare.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.get('/', authMiddleWare, catchError(userController.getAllActivated));

module.exports = { userRouter };
