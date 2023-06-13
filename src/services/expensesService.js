'use strict';

const { Expense } = require('../models/expenses');

async function getFilteredExpenses({
  userId,
  categories,
  from,
  to,
}) {
  const expenses = await Expense.findAll();

  return expenses.filter(expense => {
    const isUserIdMatch = userId
      ? expense.userId === +userId
      : true;

    const isCategoryMatch = categories
      ? categories.includes(expense.category)
      : true;

    const isFromMath = from
      ? expense.spentAt >= from
      : true;

    const isToMatch = to
      ? expense.spentAt <= to
      : true;

    return isUserIdMatch && isCategoryMatch && isFromMath && isToMatch;
  });
};

function getAllByUserId(userId) {
  return Expense.findAll({ where: { userId } });
}

function getById(id) {
  return Expense.findOne({ where: { userId: id } });
}

function create(
  userId,
  spentAt,
  title,
  amount,
  category,
  note,
) {
  const newExpenses = {
    userId,
    spentAt,
    title,
    amount,
    category,
    note,
  };

  return Expense.create(newExpenses);
}

function update({ userId, newData }) {
  return Expense.update(
    { ...newData, spentAt: Date.now() },
    { where: { userId } }
  );
}

function remove(id) {
  Expense.destroy({ where: { id } });
}

module.exports = {
  getFilteredExpenses,
  getById,
  create,
  update,
  remove,
  getAllByUserId,
};
