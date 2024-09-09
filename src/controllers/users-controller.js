import { User } from '../models/user.js';

async function getAll(req, res, next) {
  const users = await User.findAll({
    where: { activationToken: null },
    attributes: ['id', 'email'],
  });

  res.send(users);
}

export const usersController = {
  getAll,
};
