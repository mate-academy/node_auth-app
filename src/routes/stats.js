'use strict';

const { Router } = require('express');

const statsController = require('../controllers/stats');
const { catchError } = require('../middlewares/catchError');

const router = Router();

router.get('/', catchError(statsController.getStats));

module.exports = { router };
