import * as todosService from './todos.service.js';

export const getAll = async (req, res) => {
  try {
    const todos = await todosService.getAll();

    res.json(todos);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const getOne = async (req, res) => {
  try {
    const todo = await todosService.getOne(req.params.id);

    if (!todo) {
      return res.sendStatus(404);
    }

    res.json(todo);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const create = async (req, res) => {
  if (!isValidParams(req.body)) {
    return res.sendStatus(400);
  }

  try {
    const todo = await todosService.create(req.body);

    res.status(201).json(todo);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const update = async (req, res) => {
  try {
    const todo = await todosService.getOne(req.params.id);

    if (!todo) {
      return res.sendStatus(404);
    }

    if (!req.body || !isValidParams(req.body, true)) {
      return res.sendStatus(400);
    }

    const updatedTodo = await todosService.update(req.params.id, req.body);

    res.json(updatedTodo);
  } catch (err) {
    res.sendStatus(500);
  }
};

export const deleteById = async (req, res) => {
  try {
    const todo = await todosService.getOne(req.params.id);

    if (!todo) {
      return res.sendStatus(404);
    }

    await todosService.deleteById(req.params.id);

    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(500);
  }
};

const isValidParams = (params, isUpdate = false) => {
  if (!params) {
    return false;
  }

  const { title, completed, status } = params;

  if (isUpdate) {
    return Boolean(title || completed !== undefined || status);
  }

  return Boolean(title);
};
