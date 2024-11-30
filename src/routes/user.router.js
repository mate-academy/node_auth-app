const { Router } = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = Router();

userRouter.get('/', authMiddleware, catchError(userController.getAllActivated));

module.exports = { userRouter };
