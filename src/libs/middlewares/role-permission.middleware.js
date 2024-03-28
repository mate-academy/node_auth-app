'use strict';

const { userService } = require('../../services/user/user.js');
const { UserRoles } = require('../enums/user-roles.js');
const { ApiError } = require('../exceptions/api-error.js');

const rolePermissionMiddleware = async(req, res, next) => {
  const { id } = req.tokenUserData;

  const user = await userService.getById(id);

  if (!user || user.role !== UserRoles.ADMIN) {
    throw ApiError.Forbidden();
  }

  next();
};

module.exports = {
  rolePermissionMiddleware,
};
