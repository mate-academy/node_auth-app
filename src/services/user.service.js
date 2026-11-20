import { User } from '../models/user.js';

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ name, email }) {
  return { name, email };
}

export const userService = {
  findByEmail,
  normalize,
};
