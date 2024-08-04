import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

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

async function updateProfile(userId, data) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  Object.assign(user, data);
  await user.save();

  return userService.normalize(user);
}

async function updatePassword(userId, newPassword) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  user.password = newPassword;
  await user.save();
}

async function changeEmail(userId, newEmail, password) {
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

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updateProfile,
  updatePassword,
  changeEmail,
};
