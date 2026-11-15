import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';

async function getAll(req, res) {
  const users = await User.findAll({
    where: { activationToken: null },
  });

  res.send(users.map((user) => userService.normalize(user)));
}

export const userController = { getAll };
