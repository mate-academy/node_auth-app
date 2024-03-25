import { Token } from '../models/Token.js';
import { userService } from '../services/user.service.js';

const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();

  res.send(users);
};

const getAllTokens = async (req, res) => {
  try {
    const tokens = await Token.findAll();

    res.send(tokens);
  } catch (error) {
    res.send(error);
  }
};

export const usersController = {
  getAllUsers,
  getAllTokens,
};
