import bcrypt from 'bcrypt';
import { Request as ExpressRequest, RequestHandler } from 'express';
import nodeCrypto from 'crypto';

import { User } from '@prisma/client';
import { usersRepository } from '../entity/users.repository.js';
import { ApiError } from '../exeptions/api.error.js';
import { mailer } from '../utils/mailer.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../../utils/validators.js';

const checkNewName = async (req: ExpressRequest, user: User) => {
  const { newName } = req.body;

  const error = validateName(newName);

  if (!newName || error || newName === user.name) {
    throw ApiError.badRequest(
      'Name is invalid or the same as the current one',
      { error },
    );
  }

  return { name: newName };
};

const checkNewPassword = async (req: ExpressRequest) => {
  const { newPassword, confirmPassword } = req.body;

  const error = validatePassword(newPassword);

  if (newPassword !== confirmPassword || error) {
    throw ApiError.badRequest(
      'Please enter the new and confirm passwords again',
      { error },
    );
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  return { password: hashedPassword };
};

const checkNewEmail = async (req: ExpressRequest, user: User) => {
  const { currentPassword, newEmail, confirmEmail } = req.body;

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const error = validateEmail(newEmail);

  if (newEmail !== confirmEmail || error) {
    throw ApiError.badRequest('Please enter the new and confirm email again', {
      error,
    });
  }

  if (newEmail === user.email) {
    throw ApiError.badRequest(
      'Enter a different email address than your current one',
    );
  }

  const userWithEmail = await usersRepository.getByEmail(newEmail);

  if (userWithEmail) {
    throw ApiError.badRequest('Email is already taken');
  }

  const activationToken = nodeCrypto.randomBytes(32).toString('hex');

  await usersRepository.update(user.id, {
    pendingEmail: newEmail,
    activationToken,
  });

  await mailer.sendActivationLink(newEmail, activationToken);
};

const checkPassword: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (!user || !email) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || '');

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  res.json({ isPasswordValid });
};

const changeUserData: RequestHandler = async (req, res) => {
  const { id } = req.user!;
  const { type } = req.body;
  const user = (await usersRepository.getById(id)) as User;

  if (!user) {
    throw ApiError.notFound();
  }

  let dataToUpdate;

  switch (type) {
    case 'name':
      dataToUpdate = await checkNewName(req, user);
      break;

    case 'password':
      const isPasswordValid = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw ApiError.badRequest('Password is incorrect');
      }

      dataToUpdate = await checkNewPassword(req);
      break;

    case 'email':
      await checkNewEmail(req, user);
      res.sendStatus(204);

      return;

    default:
      throw ApiError.badRequest('Invalid update type');
  }

  if (dataToUpdate) {
    await usersRepository.update(id, dataToUpdate);
  }

  res.sendStatus(204);
};

export const usersController = {
  changeUserData,
  checkPassword,
  checkNewPassword,
};
