import bcrypt from 'bcrypt';
import { ApiError } from '../../exceptions/api.error.js';
import * as usersService from './users.service.js';
import { emailService } from '../../services/email.service.js';

export const getAll = async (req, res) => {
  // { activationToken: null } - filter only verified users
  const users = await usersService.getAll();

  res.send(users.map(usersService.normalize));
};

export const getOne = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.send(usersService.normalize(user));
};

export const create = async (req, res) => {
  if (!usersService.isValidParams(req.body)) {
    throw ApiError.badRequest('Invalid user params');
  }

  const user = await usersService.create(req.body);

  res.status(201).send(usersService.normalize(user));
};

export const deleteOne = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await usersService.deleteById(req.params.id);

  res.sendStatus(204);
};

export const update = async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const {
    name,
    currentPassword,
    newPassword,
    confirmNewPassword,
    password,
    newEmail,
    confirmNewEmail,
  } = req.body;
  const updates = {};
  let oldEmail = null;

  // Name change
  if (name !== undefined) {
    updates.name = name;
  }

  // Password change (requires current password verification)
  if (currentPassword && newPassword) {
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw ApiError.badRequest('Wrong password', {
        currentPassword: 'Wrong password',
      });
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('Bad Request', {
        newPassword: 'At least 6 characters',
      });
    }

    if (!confirmNewPassword) {
      throw ApiError.badRequest('Bad Request', {
        confirmNewPassword: 'Confirmation is required',
      });
    }

    if (newPassword !== confirmNewPassword) {
      throw ApiError.badRequest('Bad Request', {
        confirmNewPassword: 'Passwords do not match',
      });
    }

    updates.password = newPassword; // service auto-hashes
  }

  // Email change (requires password verification)
  if (newEmail) {
    if (!password) {
      throw ApiError.badRequest('Password is required to change email', {
        password: 'Password is required',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Wrong password', {
        password: 'Wrong password',
      });
    }

    if (!confirmNewEmail) {
      throw ApiError.badRequest('Bad Request', {
        confirmNewEmail: 'Email confirmation is required',
      });
    }

    if (newEmail !== confirmNewEmail) {
      throw ApiError.badRequest('Bad Request', {
        confirmNewEmail: 'Emails do not match',
      });
    }

    const existingUser = await usersService.findByEmail(newEmail);

    if (existingUser) {
      throw ApiError.badRequest('Email already taken', {
        newEmail: 'Email already taken',
      });
    }

    oldEmail = user.email;
    updates.email = newEmail;
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No valid fields to update');
  }

  const updatedUser = await usersService.update(req.params.id, updates);

  if (oldEmail) {
    await emailService.sendEmailChangedNotification({
      oldEmail,
      newEmail,
    });
  }

  res.send(usersService.normalize(updatedUser));
};
