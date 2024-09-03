const express = require('express');

const { catchError } = require('../utils/catchError');

const resetController = require('../controllers/reset.controller');

const resetRouter = new express.Router();

resetRouter.get('/password/:email', catchError(resetController.resetPassword));
resetRouter.post('/token/:token', catchError(resetController.changePassword));

module.exports = {
  resetRouter,
};
