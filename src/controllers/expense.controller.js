'use strict';

const { ErrorMessages } = require('../libs/enums/enums.js');
const { ApiError } = require('../libs/exceptions/api-error.js');

class ExpenseController {
  constructor(expenseService, userService) {
    this.expenseService = expenseService;
    this.userService = userService;
  }

  async getExpenses(req, res) {
    const query = req.query;

    const expenses = await this.expenseService.getExpenses(query);

    res.send(expenses);
  }

  async getExpense(req, res) {
    const id = req.params.id;

    const expense = await this.expenseService.getExpense(id);

    if (!expense) {
      throw ApiError.NotFound();
    }

    res.send(expense);
  };

  async create(req, res) {
    const body = req.body;

    const user = await this.userService.getById(body.userId);

    if (!user) {
      throw ApiError.BadRequest(ErrorMessages.USER_NO_EXIST);
    }

    const newExpense = await this.expenseService.create(body);

    res.status(201).send(newExpense);
  }

  async update(req, res) {
    const id = req.params.id;
    const body = req.body;

    const [count] = await this.expenseService.update(id, body);

    if (!count) {
      throw ApiError.NotFound();
    }

    const updatedExpense = await this.expenseService.getExpense(id);

    res.send(updatedExpense);
  }

  async remove(req, res) {
    const id = req.params.id;

    const count = await this.expenseService.remove(id);

    if (!count) {
      throw ApiError.NotFound();
    }

    res.sendStatus(204);
  }
}

module.exports = {
  ExpenseController,
};
