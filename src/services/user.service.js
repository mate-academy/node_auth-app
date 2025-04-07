import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const getById = (userId) => {
  return User.findByPk(userId);
};

const register = async ({ name, email, password }) => {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return normalize(newUser);
};

const updateUserName = async (userId, name) => {
  const user = await getById(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  user.name = name;
  await user.save();

  return normalize(user);
};

const changePassword = async (userId, newPassword) => {
  const user = await getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return user;
};

const changeEmail = async (userId, password, newEmail) => {
  const user = await getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Invalid password');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  return { oldEmail, updatedUser: user };
};

export const userService = {
  getByEmail,
  getById,
  normalize,
  register,
  updateUserName,
  changePassword,
  changeEmail,
};
