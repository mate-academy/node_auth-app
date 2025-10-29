import { User } from '../models/user.js';

async function getAllActivated(req, res) {
  const activatedUsers = await User.findAll({
    where: { activationToken: null },
  });

  return activatedUsers;
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
