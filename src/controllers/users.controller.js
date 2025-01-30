import { userService } from '../services/user.service.js';

const getAllUsers = async (req, res) => {
  const users = await userService.getAllActive();
  const normalizedUsers = users.map(userService.normalize);

  res.send(normalizedUsers);
};

export const usersController = {
  getAllUsers,
};
