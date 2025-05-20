import { User } from '../models/user.js';

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

export const userService = {
  getAllActivated,
};
