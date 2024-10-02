import { User } from '../models/User.model.js';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normolize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

export const userService = {
  getAllActivated,
  normolize,
  findByEmail,
};
