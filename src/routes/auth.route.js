const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const router = express.Router();

router.post('/registration', catchError(authController.register));
router.get('/activation/:activationToken', catchError(authController.activate));
router.post('/login', catchError(authController.login));
router.get('/refresh', catchError(authController.refresh));
router.post('/logout', catchError(authController.logout));

module.exports = { router };
