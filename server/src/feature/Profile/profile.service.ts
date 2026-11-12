import { mailer } from "../../config/mailer.js";
import { ApiError } from "../../exceptions/api.error.js";
import type { User } from "../../models/User.model.js";
import { userRepository } from "../User/user.repository.js";
import { normalizeUser, validateEmail, validatePassword } from "../User/utils.js";
import bcrypt from 'bcrypt';


const getOwner = async (userId: number) => {
  const user = await userRepository.getById(userId) as User | null;

  if (!user) {
    throw ApiError.Unauthorized('User not found');
  }

  return normalizeUser(user);
};

const changeName = async (userId: number, name: string) => {
  const updatedUser = await userRepository.update(userId, { name });

  if (updatedUser?.name !== name) {
    throw new Error('Failed to update user name');
  }
};

const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string,
  confirmation: string,
) => {
  const validationError = validatePassword(newPassword);

  if (validationError) {
    throw ApiError.BadRequest(validationError);
  }

  const user = await userRepository.getById(userId) as User | null;

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.BadRequest('Incorrect current password');
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Password not confirmed');
  }

  const password = await bcrypt.hash(newPassword, 10);
  await userRepository.update(user.id, { password });

  return {
    message: 'Your password has been changed successfully.',
  };
};

const changeEmail = async (
  userId: number,
  newEmail: string,
  password: string,
  emailConfirmation: string,
) => {
  const validationError = validateEmail(newEmail);

  if (validationError) {
    throw ApiError.BadRequest(validationError);
  }

  const user = await userRepository.getById(userId) as User | null;

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.BadRequest('Incorrect password');
  }

  if (newEmail !== emailConfirmation) {
    throw ApiError.BadRequest('Email not confirmed');
  }

  const existingUser = await userRepository.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.BadRequest('User with this email already exists');
  }

  await userRepository.update(user.id, { email: newEmail });

  await mailer.sendChangingEmail(user.email, newEmail);

  return {
    message: 'Your email has been changed successfully.',
  };
};

export const profileService = {
  getOwner,
  changeName,
  changePassword,
  changeEmail,
}
