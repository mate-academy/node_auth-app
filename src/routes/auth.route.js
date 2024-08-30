const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/register', catchError(authController.register));

module.exports = {
  authRouter,
};
