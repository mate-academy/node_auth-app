import { Todo } from "../models/Todo.js";
import { client } from "../utils/db.js";

export const getAll = async (userId) => {
  return await Todo.findAll({
    where: { userId },
    order: ["title"],
  });
};

export const getById = async (id, userId) => {
  return Todo.findOne({ where: { id, userId } });
};

export const create = (title, userId) => {
  return Todo.create({ title, userId });
};

export const update = async (id, data, userId, transaction = null) => {
  const currentTodo = await getById(id, userId);
  if (!currentTodo) return null;

  const isCompleted =
    data.completed !== undefined
      ? data.completed === true || data.completed === "true"
      : currentTodo.completed;

  await currentTodo.update(
    {
      title: data.title !== undefined ? data.title : currentTodo.title,
      completed: isCompleted,
    },
    { transaction }
  );

  return currentTodo;
};

export const updateMany = async (items, userId) => {
  await client.transaction(async (t) => {
    await Promise.all(items.map((item) => update(item.id, item, userId, t)));
  });

  return getAll(userId);
};

export const remove = async (id, userId) => {
  return await Todo.destroy({ where: { id, userId } });
};
