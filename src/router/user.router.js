const express = require('express');
const userController = require('./../controller/user.controller.js');
const authMiddleware = require('./../middlewares/auth.middleware.js');

const router = express.Router();

router.get('/', authMiddleware, userController.getAllUsers);
router.patch('/name', authMiddleware, userController.updateUserName);
router.patch('/email', authMiddleware, userController.updateUserEmail);
router.patch('/password', authMiddleware, userController.updateUserPassword);

module.exports = router;
