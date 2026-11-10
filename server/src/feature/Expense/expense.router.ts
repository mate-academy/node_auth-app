import { Router } from 'express';
import { expenseController } from './expense.controller.js';

export const expenseRouter = Router();

expenseRouter.get('/', expenseController.getAll);
expenseRouter.get('/:id', expenseController.getById);
expenseRouter.post('/', expenseController.create);
expenseRouter.patch('/:id', expenseController.update);
expenseRouter.delete('/:id', expenseController.deleteOne);
