import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exceptions/api.error.js';

const getAllUsers = async (req, res) => {
  const users = await userService.getAllActive();
  const normalizedUsers = users.map(userService.normalize);

  res.send(normalizedUsers);
};

const changeName = async (req, res) => {
  const { newName } = req.body;
  const { id: userId } = res.locals.user;

  const isNameValid = userService.validateName(newName);

  if (isNameValid) {
    throw ApiError.badRequest('Bad request', isNameValid);
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.name = newName;
  await user.save();

  res.json({ message: 'Name successfully updated', name: user.name });
};
export const usersController = {
  getAllUsers,
};
