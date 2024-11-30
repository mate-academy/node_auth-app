const { Router } = require('express');
const { authController } = require('../controllers/auth.controller.js');

const authRouter = Router();

authRouter.get('/', authController.activate);

module.exports = { authRouter };
