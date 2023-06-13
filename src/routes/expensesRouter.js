'use strict';

const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');
const expensesController = require('../controllers/expensesController');

const router = express.Router();

router.get('/',
  catchError(authMiddleware),
  catchError(expensesController.getByFilter));

router.get('/:id',
  catchError(authMiddleware),
  catchError(expensesController.getById));

router.post('/',
  catchError(authMiddleware),
  catchError(expensesController.create));

router.patch('/:id',
  catchError(authMiddleware),
  catchError(expensesController.update));

router.delete('/:id',
  catchError(authMiddleware),
  catchError(expensesController.remove));

module.exports = router;
