const express = require('express');
const { userController } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const router = express.Router();

router.get('/', authMiddleware, catchError(userController.getAllActivated));

router.post(
  '/change-password',
  catchError(userController.requestChangePassword),
);

router.post(
  '/change-password/:resetToken',
  catchError(userController.resetPassword),
);

router.patch('/email', authMiddleware, catchError(userController.changeEmail));

router.patch('/name', authMiddleware, catchError(userController.changeName));

module.exports = { router };
