import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { usersRepository } from '../entity/users.repository';
import { userService } from '../services/user.service';
import { mailer } from '../services/email.service';

const updateName: RequestHandler = async (req, res) => {
  const { userId, name } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User id is required' });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }

  const user = await usersRepository.updateName(userId, name.trim());

  res.json({ user: userService.normalize(user) });
};

const updatePassword: RequestHandler = async (req, res) => {
  const { userId, oldPassword, newPassword, confirmation } = req.body;

  if (!userId || !oldPassword || !newPassword || !confirmation) {
    return res.status(400).json({
      message: 'All password fields are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: 'At least 6 characters',
    });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({
      message: 'Passwords do not match',
    });
  }

  const user = await usersRepository.getById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    return res.status(400).json({
      message: 'Old password is incorrect',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await usersRepository.updatePassword(userId, hashedPassword);

  res.json({ user: userService.normalize(updatedUser) });
};

const updateEmail: RequestHandler = async (req, res) => {
  const { userId, password, email } = req.body;

  if (!userId || !password || !email) {
    return res.status(400).json({
      message: 'User id, password and email are required',
    });
  }

  const emailError = userService.validateEmail(email);

  if (emailError) {
    return res.status(400).json({ message: emailError });
  }

  const user = await usersRepository.getById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: 'Password is incorrect',
    });
  }

  const oldEmail = user.email;

  const updatedUser = await usersRepository.updateEmail(userId, email);

  await mailer.send(
    oldEmail,
    'Email was changed',
    `
      <h1>Email changed</h1>
      <p>Your account email was changed from ${oldEmail} to ${email}.</p>
    `,
  );

  res.json({ user: userService.normalize(updatedUser) });
};

export const profileController = {
  updateName,
  updatePassword,
  updateEmail,
};
