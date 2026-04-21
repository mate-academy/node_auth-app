const { Router } = require('express');
const { expensesController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const expensesRouter = Router();

expensesRouter.use(authMiddleware);

expensesRouter.post('/', expensesController.create);
expensesRouter.get('/', expensesController.getAll);
expensesRouter.get('/:id', expensesController.getOne);
expensesRouter.delete('/:id', expensesController.remove);
expensesRouter.patch('/:id', expensesController.update);

module.exports = expensesRouter;
