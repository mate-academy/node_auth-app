'use strict';

/**
 * AuthRoutes — Rotas de autenticação.
 * Aplica guestMiddleware nas rotas que só podem ser acessadas
 * por usuários não autenticados (registro, login, reset de senha).
 */
const express = require('express');
const authController = require('../controllers/authController');
const { guestMiddleware } = require('../middlewares/guestMiddleware');

const router = express.Router();

// Rotas apenas para usuários NÃO autenticados
router.post('/register', guestMiddleware, authController.register);
router.get('/activate/:token', guestMiddleware, authController.activate);
router.post('/login', guestMiddleware, authController.login);

router.post(
  '/reset-password',
  guestMiddleware,
  authController.requestPasswordReset,
);

router.post(
  '/reset-password/:token',
  guestMiddleware,
  authController.confirmPasswordReset,
);

// Rotas que podem ser acessadas por qualquer usuário
router.post('/logout', authController.logout);
router.get('/refresh', authController.refreshTokens);

module.exports = router;
