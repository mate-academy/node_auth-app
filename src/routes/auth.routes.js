'use strict';

const router = require('express').Router();

const {
  register,
  activate,
  login,
  profile,
} = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth_middleware');

router.post('/register', register);

router.get('/activate/:token', activate);

router.post('/login', login);

router.get('/profile', authMiddleware, profile);

module.exports = router;
