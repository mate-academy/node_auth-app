'use strict';

const ApiRoutes = {
  AUTH: '/auth',
  USERS: '/users',
  PROFILE: '/profile',
  EXPENSES: '/expenses',
  REGISTRATION: '/registration',
  ACTIVATION: '/activation/:activationToken',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  REQUEST_RESET: '/request-reset-password',
  VERIFY_TOKEN: '/verify-reset-token/:resetToken',
  RESET: '/reset-password/:resetToken',
  EDIT_USERNAME: '/edit-username',
  EDIT_EMAIL_REQUEST: '/request-edit-email',
  EDIT_EMAIL: '/edit-email',
  EDIT_PASSWORD: '/edit-password',
};

module.exports = {
  ApiRoutes,
};
