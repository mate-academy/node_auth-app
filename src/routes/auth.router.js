'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate.middleware');

const router = Router();

// POST /api/auth/register
router.post('/register', ctrl.register);

// POST /api/auth/activate/:token
router.post('/activate/:token', ctrl.activate);

// POST /api/auth/login
router.post('/login', ctrl.login);

// POST /api/auth/logout  (authenticated)
router.post('/logout', authenticate, ctrl.logout);

// POST /api/auth/forgot-password
router.post('/forgot-password', ctrl.forgotPassword);

// GET  /api/auth/validate-reset/:token  (check before showing the reset form)
router.get('/validate-reset/:token', ctrl.validateResetToken);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', ctrl.resetPassword);

module.exports = router;
