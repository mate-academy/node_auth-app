import { Router } from 'express';
import * as expensesController from './expense.controller.js';
import { catchError } from '../../utils/catchError.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const expenses = Router();

expenses.get('/', authMiddleware, catchError(expensesController.getAll));
expenses.get('/:id', authMiddleware, catchError(expensesController.getOne));
expenses.post('/', authMiddleware, catchError(expensesController.create));

expenses.delete(
  '/:id',
  authMiddleware,
  catchError(expensesController.deleteOne),
);
expenses.patch('/:id', authMiddleware, catchError(expensesController.update));

export default expenses;
