const { Router } = require('express');
const { authController } = require('../controllers/auth.controller.js');

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.get('/activation/:activationToken', authController.activate);

module.exports = { authRouter };
