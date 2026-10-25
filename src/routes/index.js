'use strict';

const express = require('express');
const authRoutes = require('./authRoutes');
const passwordResetRoutes = require('./passwordResetRoutes');
const profileRoutes = require('./profileRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect(req.user ? '/profile' : '/login');
});
router.use(authRoutes);
router.use(passwordResetRoutes);
router.use(profileRoutes);

module.exports = router;
