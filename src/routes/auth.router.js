const { Router } = require('express');
const { authController } = require('../controllers/auth.controller.js');

const authRouter = Router();

authRouter.get('/', authController.auth);
authRouter.post('/register', authController.register);

module.exports = { authRouter };
