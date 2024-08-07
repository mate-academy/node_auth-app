const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const router = new express.Router();

router.post('/registration', catchError(authController.register));
router.get('/activation/:activationToken', catchError(authController.activate));
router.post('/login', catchError(authController.login));
router.get('/refresh', catchError(authController.refresh));
router.post('/logout', catchError(authController.logout));
router.post('/changePassword', catchError(authController.resetPassword));
router.post('/changeAuthPassword', catchError(authController.changeAuthPass));
router.post('/reset', catchError(authController.reset));
router.get('/reset/:resetToken', catchError(authController.resetChecker));
router.patch('/update', catchError(authController.updateUserName));
router.patch('/confirmChangeEmail', catchError(authController.changeEmail));

module.exports = router;
