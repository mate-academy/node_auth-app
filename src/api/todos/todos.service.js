import { Todo } from './Todo.model.js';

export const getAll = async () => {
  const todos = await Todo.findAll({
    order: [['createdAt', 'DESC']],
  });

  return todos;
};

export const getOne = async (id) => {
  const todo = await Todo.findOne({ where: { id } });

  return todo;
};

export const create = async (todo) => {
  const newTodo = await Todo.create(todo);

  return newTodo;
};

export const update = async (id, todo) => {
  await Todo.update(todo, { where: { id } });

  const updatedTodo = await Todo.findOne({ where: { id } });

  return updatedTodo;
};

export const deleteById = async (id) => {
  const deletedTodo = await Todo.destroy({ where: { id } });

  return deletedTodo;
};

export const isValidParams = (params, isUpdate = false) => {
  if (!params) {
    return false;
  }

  const { title, completed, status } = params;

  if (isUpdate) {
    return Boolean(title || completed !== undefined || status);
  }

  return Boolean(title);
};
