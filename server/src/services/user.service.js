import { Op } from 'sequelize';
import { ApiError } from '../exceptions/api.error.js';
import { Token } from '../models/token.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

function normalize({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function findById(userId) {
  return User.findOne({ where: { id: userId } });
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function getAll() {
  return User.findAll();
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist');
  }

  await User.create({ name, email, password, activationToken });
  await emailService.sendActivationEmail(email, activationToken);
}

async function changeName(email, newName) {
  const [_, updatedUser] = await User.update(
    { name: newName },
    { where: { email }, returning: true, plain: true },
  );

  return updatedUser;
}

async function changePassword(email, newPassword) {
  await User.update({ password: newPassword }, { where: { email } });
}

async function changeEmail(userId, newEmail, token) {
  const [_, updatedUser] = await User.update(
    { email: newEmail, activationToken: token },
    { where: { id: userId }, returning: true, plain: true },
  );

  return updatedUser;
}

async function forgotPassword(user, email) {
  const resetToken = uuidv4();

  const existingToken = await Token.findOne({
    where: {
      userId: user.id,
    },
  });

  if (existingToken) {
    existingToken.resetToken = resetToken;
    await existingToken.save();
  } else {
    await user.createToken({
      resetToken,
    });
  }

  await emailService.sendResetEmail(email, resetToken);
}

async function securityEmail(
  userId,
  securityToken,
  oldEmail,
  securityExpiresAt,
) {
  await Token.update(
    { securityToken, oldEmail, securityExpiresAt },
    { where: { userId } },
  );
}

export const userService = {
  normalize,
  findById,
  findByEmail,
  register,
  getAll,
  changeName,
  changePassword,
  changeEmail,
  forgotPassword,
  securityEmail,
};
