import * as todosService from './todos.service.js';
import { ApiError } from '../../exceptions/api.error.js';

export const getAll = async (req, res) => {
  const todos = await todosService.getAll();

  res.json(todos);
};

export const getOne = async (req, res) => {
  const todo = await todosService.getOne(req.params.id);

  if (!todo) {
    throw ApiError.notFound('Todo not found');
  }

  res.json(todo);
};

export const create = async (req, res) => {
  if (!todosService.isValidParams(req.body)) {
    throw ApiError.badRequest('Invalid todo params');
  }

  const todo = await todosService.create(req.body);

  res.status(201).json(todo);
};

export const update = async (req, res) => {
  const todo = await todosService.getOne(req.params.id);

  if (!todo) {
    throw ApiError.notFound('Todo not found');
  }

  if (!req.body || !todosService.isValidParams(req.body, true)) {
    throw ApiError.badRequest('Invalid request');
  }

  const updatedTodo = await todosService.update(req.params.id, req.body);

  res.send(updatedTodo);
};

export const deleteById = async (req, res) => {
  const todo = await todosService.getOne(req.params.id);

  if (!todo) {
    throw ApiError.notFound('Todo not found');
  }

  await todosService.deleteById(req.params.id);

  res.sendStatus(204);
};
