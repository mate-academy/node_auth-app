const express = require('express');
const { authController } = require('../controller/authController.js');
const { catchError } = require('../utills/catchError.js');

const router = express.Router();

router.post('/register', catchError(authController.register));
router.get('/activate/:activationToken', catchError(authController.activate));
router.post('/login', catchError(authController.login));
router.post('/recover', catchError(authController.recover));

router.post(
  '/recover/:activationToken',
  catchError(authController.changePassword),
);
router.get('/refresh', catchError(authController.refresh));
router.post('/logout', catchError(authController.logout));

module.exports = { router };
