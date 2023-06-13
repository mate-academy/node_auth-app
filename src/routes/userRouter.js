/* eslint-disable max-len */
'use strict';

const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');
const userRouter = new express.Router();

userRouter.get('/', catchError(authMiddleware), catchError(userController.getAll));
userRouter.patch('/:id', catchError(authMiddleware), catchError(userController.update));

module.exports = { userRouter };
