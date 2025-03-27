import { userService } from '../services/userService';

async function getAll(req, res, next) {
  const users = await userService.getAll();

  res.send(users.map(userService.normalize));
}

export const userController = { getAll };
