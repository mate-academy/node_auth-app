import { User } from '../models/User.model.js';
import { userServices } from '../services/user.services.js';
import { emailServices } from '../services/email.services.js';
import bcrypt from 'bcrypt';

const getAllUsers = async (req, res) => {
  const users = await User.findAll();

  res.send(users);
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  const user = await userServices.findUserById(userId);

  res.send(user);
};

const updateName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Name is required' });

      return;
    }

    const user = await userServices.updateNameService(userId, name);

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const userId = req.user.userId;

  if (newPassword !== confirmation) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const user = await userServices.findUserById(userId);
  const isValid = await bcrypt.compare(oldPassword, user.password);

  if (!isValid) {
    res.status(401).json({ message: 'Old password is incorrect' });

    return;
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail, confirmation } = req.body;
  const userId = req.user.userId;

  if (!newEmail || !confirmation) {
    res
      .status(400)
      .json({ message: 'New email and confirmation are required' });

    return;
  }

  if (newEmail !== confirmation) {
    res.status(400).json({ message: 'Emails do not match' });

    return;
  }

  const user = await userServices.findUserById(userId);

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    res.status(401).json({ message: 'Invalid password' });

    return;
  }

  const oldEmail = user.email;

  user.email = newEmail;

  await user.save();
  await emailServices.sendEmailChangedNotification(oldEmail, newEmail);

  res.send({ message: 'Email updated successfully' });
};

export const userController = {
  getAllUsers,
  getUserById,
  updateName,
  updateEmail,
  updatePassword,
};
