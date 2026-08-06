import { Router } from 'express';
import * as todosController from './todos.controller.js';
import { catchError } from '../../utils/catchError.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const todos = Router();

todos.get('/', authMiddleware, catchError(todosController.getAll));
todos.get('/:id', authMiddleware, catchError(todosController.getOne));
todos.post('/', authMiddleware, catchError(todosController.create));
todos.delete('/:id', authMiddleware, catchError(todosController.deleteById));
todos.patch('/:id', authMiddleware, catchError(todosController.update));

export default todos;
