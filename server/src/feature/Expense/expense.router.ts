import { Router } from 'express';
import { expenseController } from './expense.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export const expenseRouter = Router();

expenseRouter.get('/', authMiddleware, expenseController.getAll);
expenseRouter.get('/:id', authMiddleware, expenseController.getById);
expenseRouter.post('/', authMiddleware, expenseController.create);
expenseRouter.patch('/:id', authMiddleware, expenseController.update);
expenseRouter.delete('/:id', authMiddleware, expenseController.deleteOne);
