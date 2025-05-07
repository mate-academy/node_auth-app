import { usersService } from '../services/users.service.js';
import { normalize } from '../utils/validate.js';

const getAll = async (req, res) => {
  const users = await usersService.getAllActive();

  if (!users) {
    return res.status(400).json({ message: 'Something went wrong!' });
  }

  res.json(users.map(normalize));
};

const getUserByEmail = async (req, res) => {
  const user = req.user;
  // const user = await usersService.getUser(email);

  if (!user) {
    return res.status(400).json({
      message: "User with this email doesn' exist",
    });
  }

  res.json({
    user: normalize(user),
    isActive: !!user.activationToken,
  });
};

const updateUser = async (req, res) => {
  const { email } = req.params;
  const data = req.body;

  // const user = await usersService.getActiveUser(email);
  const user = req.user;

  if (!user) {
    return res.status(400).json({
      message: "User with this email doesn' exist",
    });
  }

  const updatedUser = await usersService.updateUser(email, data);

  res.json(normalize(updatedUser));
};

export const userController = {
  getAll,
  getUserByEmail,
  updateUser,
};
