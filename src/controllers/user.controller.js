import { userService } from '../services/user.service.js';

const getAll = async (req, res) => {
  const users = await userService.getAllUsers();

  res.send(users.map(userService.normalize));
};

export const userController = {
  getAll,
};
