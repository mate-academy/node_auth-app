import { v4 as uuid4 } from 'uuid';
import { User } from '../models/user.js';
import { ApiError } from '../exceptions.js/api-errors.js';
import modeCrypto from 'crypto';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

export const generateActiveToken = () => {
  return uuid4();
};

export const createUser = async ({
  name,
  email,
  password,
  activationToken,
}) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw ApiError.BadRequest('User already exist', {
      email: 'Email is used by another user',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });
};

export const findUserByActiveToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

export const consumeActivationToken = async (user) => {
  user.activationToken = null;
  await user.save();

  return user;
};

export const findActivatedUser = async (email) => {
  return User.findOne({ where: { email, activationToken: null } });
};

export const compareUserPassword = (incomingPassword, user) => {
  return bcrypt.compare(incomingPassword, user.password);
};

export const generatePasswordResetToken = async (user) => {
  const token = modeCrypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15);
  await user.save();

  return token;
};

export const findByPasswordResetToken = async (token) => {
  return User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });
};

export const resetUserPassword = async (user, newPassword) => {
  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return user;
};

export const updateUserName = async (user, newName) => {
  if (!newName) {
    throw ApiError.BadRequest('Name cannot be empty');
  }

  user.name = newName;
  await user.save();

  return user;
};

export const updateUserEmail = async (user, newEmail) => {
  const existingUser = await User.findOne({ where: { email: newEmail } });

  if (existingUser) {
    throw ApiError.BadRequest('Email already in use');
  }

  user.email = newEmail;
  await user.save();

  return user;
};

export const updateUserPassword = async (
  user,
  currentPassword,
  newPassword,
) => {
  const match = await compareUserPassword(currentPassword, user);

  if (!match) {
    throw ApiError.Unauthorized('Current password is incorrect');
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  await user.save();

  return user;
};
