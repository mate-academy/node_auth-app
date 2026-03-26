'use strict';

/**
 * UserRoutes — Rotas do perfil do usuário.
 * Todas as rotas exigem autenticação (authMiddleware).
 */
const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

router.get('/', userController.getProfile);
router.patch('/name', userController.changeName);
router.patch('/password', userController.changePassword);
router.patch('/email', userController.changeEmail);

module.exports = router;
