'use strict';

class ExpenseService {
  constructor(expenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async getExpenses({ userId, categories = [], from, to }) {
    const categoriesArray = Array.isArray(categories)
      ? categories
      : [categories];

    return this.expenseRepository.getExpenses({
      userId,
      categoriesArray,
      from,
      to,
    });
  }

  async getExpense(id) {
    return this.expenseRepository.getExpense(id);
  }

  async create(data) {
    return this.expenseRepository.create(data);
  }

  async update(id, data) {
    return this.expenseRepository.update(id, data);
  }

  async remove(id) {
    return this.expenseRepository.remove(id);
  }
}

module.exports = {
  ExpenseService,
};
