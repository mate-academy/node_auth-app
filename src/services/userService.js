'use strict';

import { User } from '../models/User.js';
import { ApiError } from '../exceptions/ApiError.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import emailService from './emailService.js';
import jwtService from './jwtService.js';
import tokenService from './tokenService.js';

const getAllActive = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
    order: ['id'],
  });
};

const getByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

const register = async(name, email, password) => {
  const existingError = await getByEmail(email);

  if (existingError) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name, email, password: hash, activationToken,
  });

  await emailService.sendActivalionLink(email, activationToken);
};

const reset = async(email) => {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User with this email does not exist');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;

  await user.save();

  await emailService.sendPasswordResetLink(email, resetToken);
};

const checkIfAuthorized = async(refreshToken) => {
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  return userData;
};

const normalize = ({ id, name, email }) => {
  return {
    id, name, email,
  };
};

export default {
  getAllActive,
  getByEmail,
  register,
  normalize,
  checkIfAuthorized,
  reset,
};
