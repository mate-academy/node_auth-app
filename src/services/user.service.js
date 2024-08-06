import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../exeptions/api.error.js';

function getAllActivated() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);
  if (existUser) {
    throw ApiError.BadRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

async function updateName(userId, newName) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  user.name = newName;
  await user.save();

  return normalize(user);
}

async function updateEmail(userId, newEmail, password) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  const existingUser = await findByEmail(newEmail);

  if (existingUser) {
    throw ApiError.BadRequest('Email already in use');
  }

  await emailService.sendEmailChangeNotification(user.email, newEmail);

  user.email = newEmail;
  await user.save();
}

async function updatePassword(userId, currentPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.NotFound();
  }
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw ApiError.BadRequest('Current password is incorrect');
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updateName,
  updateEmail,
  updatePassword,
};
