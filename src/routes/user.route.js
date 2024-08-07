const express = require('express');
const userController = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');

const router = new express.Router();

router.get('/', catchError(userController.getAllActive));
router.get('/profile', catchError(userController.getProfile));
router.patch('/name', catchError(userController.updateName));
router.patch('/password', catchError(userController.updatePassword));
router.patch('/email', catchError(userController.updateEmail));

module.exports = router;
