import { User } from '../models/user.js';

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
};
