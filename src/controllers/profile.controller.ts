import { RequestHandler } from 'express';
import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcryptjs';
import { mailer } from '../services/email.service.js';

const getCurrentUser = async (userId: number) => User.findByPk(userId);

const get: RequestHandler = async (req, res) => {
  const { id } = res.locals.user as { id: number };
  const user = await getCurrentUser(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });

    return;
  }

  res.json(userService.normalize(user));
};

const changeName: RequestHandler = async (req, res) => {
  const { id } = res.locals.user as { id: number };
  const name = String(req.body.name ?? '').trim();

  if (!name) {
    res.status(400).json({
      errors: { name: 'Name is required' },
      message: 'Validation error',
    });

    return;
  }

  const user = await getCurrentUser(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });

    return;
  }

  user.name = name;
  await user.save();

  res.json(userService.normalize(user));
};

const changePassword: RequestHandler = async (req, res) => {
  const { id } = res.locals.user as { id: number };
  const { oldPassword, newPassword, confirmation } = req.body;

  const errors = {
    newPassword: userService.validatePassword(newPassword),
    confirmation:
      newPassword !== confirmation ? 'Passwords do not match' : undefined,
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const user = await getCurrentUser(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });

    return;
  }

  const isOldValid = await bcrypt.compare(
    String(oldPassword ?? ''),
    user.password,
  );

  if (!isOldValid) {
    res.status(400).json({
      errors: { oldPassword: 'Wrong password' },
      message: 'Validation error',
    });

    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.sendStatus(204);
};

const changeEmail: RequestHandler = async (req, res) => {
  const { id } = res.locals.user as { id: number };
  const { password } = req.body;
  const newEmail = String(req.body.email ?? '')
    .trim()
    .toLowerCase();
  const confirmation = String(req.body.confirmation ?? '')
    .trim()
    .toLowerCase();

  const errors = {
    email: userService.validateEmail(newEmail),
    confirmation: newEmail !== confirmation ? 'Emails do not match' : undefined,
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const user = await getCurrentUser(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });

    return;
  }

  const isPasswordValid = await bcrypt.compare(
    String(password ?? ''),
    user.password,
  );

  if (!isPasswordValid) {
    res.status(400).json({
      errors: { password: 'Wrong password' },
      message: 'Validation error',
    });

    return;
  }

  const taken = await User.findOne({ where: { email: newEmail } });

  if (taken) {
    res.status(409).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await mailer.sendEmailChangedNotification(oldEmail, newEmail);

  res.json(userService.normalize(user));
};

export const profileController = {
  get,
  changeName,
  changePassword,
  changeEmail,
};
