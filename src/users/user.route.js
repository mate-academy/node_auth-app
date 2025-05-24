const { authMiddleware } = require('../middlewares/auth');
const controller = require('./user.controller');
const express = require('express');

const router = express.Router();

router.patch('/:id', authMiddleware, controller.update);

module.exports = { router };
