import { Router } from 'express';
import * as todosController from './todos.controller.js';
import { catchError } from '../../utils/catchError.js';

const todos = Router();

todos.get('/', catchError(todosController.getAll));
todos.get('/:id', catchError(todosController.getOne));
todos.post('/', catchError(todosController.create));
todos.delete('/:id', catchError(todosController.deleteById));
todos.patch('/:id', catchError(todosController.update));

export default todos;
