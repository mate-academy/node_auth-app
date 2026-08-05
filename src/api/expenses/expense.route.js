import { Router } from 'express';
import * as expensesController from './expense.controller.js';

const expenses = Router();

expenses.get('/', expensesController.getAll);
expenses.get('/:id', expensesController.getOne);
expenses.post('/', expensesController.create);
expenses.delete('/:id', expensesController.deleteOne);
expenses.patch('/:id', expensesController.update);

export default expenses;
