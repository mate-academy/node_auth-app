import { User } from '../models/user.js';

async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, email }) {
  return {
    id,
    email,
  };
}

export const userService = {
  getAllActivated,
  findByEmail,
  normalize,
};
