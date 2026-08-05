import { Router } from 'express';
import * as expensesController from './expense.controller.js';
import { catchError } from '../../utils/catchError.js';

const expenses = Router();

expenses.get('/', catchError(expensesController.getAll));
expenses.get('/:id', catchError(expensesController.getOne));
expenses.post('/', catchError(expensesController.create));
expenses.delete('/:id', catchError(expensesController.deleteOne));
expenses.patch('/:id', catchError(expensesController.update));

export default expenses;
