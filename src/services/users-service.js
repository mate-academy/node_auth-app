import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model.js';

export const getAllActiveUsers = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
    attributes: ['id', 'email'],
  });
};

export const generateActivationToken = () => uuidv4();
