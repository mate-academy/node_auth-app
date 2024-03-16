'use strict';

const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../middlewares/catchError');

const categoryRouter = express.Router();

categoryRouter.get('/', authMiddleware,
  catchError(categoryController.getAllByUser)
);

categoryRouter.post('/', authMiddleware,
  catchError(categoryController.addOne)
);

categoryRouter.patch('/:id', authMiddleware,
  catchError(categoryController.updateOne)
);

categoryRouter.delete('/:id', authMiddleware,
  catchError(categoryController.deleteOne)
);

module.exports = categoryRouter;
