'use strict';

const { ApiRoutes } = require('../libs/enums/api-routes.js');
const { authRouter } = require('./auth.router.js');
const { userRouter } = require('./user.router.js');
const { profileRouter } = require('./profile.router.js');
const { expenseRouter } = require('./expense.router.js');

const initRoutes = (app) => {
  app.use(ApiRoutes.AUTH, authRouter);
  app.use(ApiRoutes.PROFILE, profileRouter);
  app.use(ApiRoutes.USERS, userRouter);
  app.use(ApiRoutes.EXPENSES, expenseRouter);
};

module.exports = {
  initRoutes,
};
