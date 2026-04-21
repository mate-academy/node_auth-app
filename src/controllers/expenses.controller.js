const { expensesService } = require('../services');

const create = async (req, res) => {
  const { spentAt, title, amount, category, note } = req.body;
  const userId = req.user.id;

  if (!title || amount == null || !spentAt) {
    return res.sendStatus(400);
  }

  const expense = await expensesService.create({
    userId,
    spentAt,
    title,
    amount,
    category,
    note,
  });

  res.status(201).json(expensesService.normalize(expense));
};

const getAll = async (req, res) => {
  const { categories, from, to } = req.query;
  const userId = req.user.id;

  const expenses = await expensesService.getAll({
    userId,
    categories,
    from,
    to,
  });

  res.json(expenses.map((expense) => expensesService.normalize(expense)));
};

const getOne = async (req, res) => {
  const expense = await expensesService.getOne(Number(req.params.id));

  if (!expense || expense.userId !== req.user.id) {
    return res.sendStatus(404);
  }

  res.json(expensesService.normalize(expense));
};

const update = async (req, res) => {
  const { id } = req.params;
  const expense = await expensesService.getOne(Number(id));

  if (!expense || expense.userId !== req.user.id) {
    return res.sendStatus(404);
  }

  const allowedFields = ['title', 'amount', 'spentAt', 'category', 'note'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return res.sendStatus(400);
  }

  const updatedExpense = await expensesService.update(Number(id), updateData);

  res.json(expensesService.normalize(updatedExpense));
};

const remove = async (req, res) => {
  const expense = await expensesService.getOne(Number(req.params.id));

  if (!expense || expense.userId !== req.user.id) {
    return res.sendStatus(404);
  }

  const expensesRemoved = await expensesService.remove(Number(req.params.id));

  if (!expensesRemoved) {
    return res.sendStatus(404);
  }

  res.sendStatus(204);
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
