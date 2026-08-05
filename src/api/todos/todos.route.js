import { Router } from 'express';
import * as todosController from './todos.controller.js';

const todos = Router();

todos.get('/', todosController.getAll);
todos.get('/:id', todosController.getOne);
todos.post('/', todosController.create);
todos.delete('/:id', todosController.deleteById);
todos.patch('/:id', todosController.update);

export default todos;
