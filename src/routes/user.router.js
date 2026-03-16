'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate.middleware');

const router = Router();

// All /api/user routes require a valid JWT
router.use(authenticate);

// GET  /api/user/profile
router.get('/profile', ctrl.getProfile);

// PUT  /api/user/name
router.put('/name', ctrl.updateName);

// PUT  /api/user/password
router.put('/password', ctrl.changePassword);

// POST /api/user/request-email-change
router.post('/request-email-change', ctrl.requestEmailChange);

// POST /api/user/confirm-email-change/:token
router.post('/confirm-email-change/:token', ctrl.confirmEmailChange);

module.exports = router;
