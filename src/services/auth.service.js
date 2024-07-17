import { ApiError } from '../exeptions/api.errors.js';
import { userService } from './user.service.js';

const register = async (name, email, password, activationToken) => {
  const existingUser = await userService.findUserByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await userService.createUser(name, email, password, activationToken);
};

export const authService = {
  register,
};
