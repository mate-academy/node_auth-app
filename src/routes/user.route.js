const express = require('express');
const userController = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');

const router = new express.Router();

router.get('/', catchError(userController.getAllActive));
router.get('/profile', catchError(userController.getProfile));
router.patch('/profile/name', catchError(userController.updateName));
router.patch('/profile/email', catchError(userController.updateEmail));
router.patch('/profile/password', catchError(userController.updatePassword));

module.exports = router;
