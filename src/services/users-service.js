import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model.js';
import {
  findActivatedUserByEmail,
  findActivatedUserById,
} from './auth-service.js';
import { ApiError } from '../exceptions/API-error.js';

export const getAllActiveUsers = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
    attributes: ['id', 'email'],
  });
};

export const updateUserName = async (newName, userId) => {
  const user = await findActivatedUserById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('name', newName);
};

export const updateUserEmail = async (newEmail, userId) => {
  const user = await findActivatedUserById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('email', newEmail);
};

export const generateActivationToken = () => uuidv4();
