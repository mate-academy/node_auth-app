import { ApiError } from '../exceptions/api.error.js';

import { emailService } from '../services/email.service.js';

import { userService } from '../services/user.service.js';

import { validateEmail } from './auth.controller.js';

import bcrypt from 'bcrypt';

const changeName = async (req, res) => {
  const { newName } = req.body;

  if (!newName) {
    throw ApiError.badRequest('Bad request');
  }

  const user = await userService.getUser(req);

  user.name = newName;

  await user.save();

  res.send(userService.normalize(user));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!newPassword || !oldPassword) {
    throw ApiError.badRequest('Bad request');
  }

  const user = await userService.getUser(req);

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;

  await user.save();

  res.sendStatus(204);
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!password) {
    throw ApiError.badRequest('Bad request');
  }

  const user = await userService.getUser(req);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await emailService.send({
    email: user.email,

    subject: 'Email change',

    html: `


      <h1>Email changed to ${newEmail}</h1>


    `,
  });

  const emailError = validateEmail(newEmail);

  if (emailError) {
    return res.status(400).json({ message: emailError });
  }

  user.email = newEmail;

  await user.save();

  res.send(userService.normalize(user));
};

export const profileController = {
  changeName,

  changePassword,

  changeEmail,
};
