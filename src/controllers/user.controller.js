import { userService } from '../services/user.service.js';

const getAll = async (req, res) => {
  const users = await userService.getAllUsers();

  res.send(users);
};

export const userController = {
  getAll,
};
