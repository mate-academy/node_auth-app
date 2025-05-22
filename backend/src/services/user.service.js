import { User } from '../models/user.js';

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, email, username }) {
  return { id, email, username };
}

export const userService = {
  getAllActivated,
  findByEmail,
  normalize,
};
