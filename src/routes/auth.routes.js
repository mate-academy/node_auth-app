const express = require('express');
const router = express.Router();

const { authController } = require('../controllers/auth.controller');
const { guestMiddleware } = require('../middlewares/auth.middleware');

router.post('/registration', guestMiddleware, authController.registration);

router.get(
  '/activation/:activationToken',
  guestMiddleware,
  authController.activation,
);
router.post('/login', guestMiddleware, authController.login);

module.exports = { router };
