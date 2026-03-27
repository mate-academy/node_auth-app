const { Router } = require('express');
const {
  categoriesController,
} = require('../controllers/categories.controller');
const authenticate = require('../middlewares/authenticate');

const categoriesRouter = Router();

categoriesRouter.get('/', authenticate, categoriesController.getAll);
categoriesRouter.post('/', authenticate, categoriesController.create);
categoriesRouter.get('/:id', authenticate, categoriesController.getOne);
categoriesRouter.delete('/:id', authenticate, categoriesController.deleteOne);
categoriesRouter.patch('/:id', authenticate, categoriesController.update);

module.exports = {
  categoriesRouter,
};
