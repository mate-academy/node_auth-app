const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const { expensesController } = require('../controllers/expenses.controller');

const expensesRouter = Router();

expensesRouter.get('/', authenticate, expensesController.getAll);
expensesRouter.post('/', authenticate, expensesController.create);
expensesRouter.get('/:id', authenticate, expensesController.getOne);
expensesRouter.patch('/:id', authenticate, expensesController.update);
expensesRouter.delete('/:id', authenticate, expensesController.deleteOne);

module.exports = {
  expensesRouter,
};
