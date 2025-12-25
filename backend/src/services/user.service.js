import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import { emailService } from "./email.service.js";
import bcrypt from 'bcrypt';
import { Op } from "sequelize";

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    }
  })
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } })
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists'
    });

  }

  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

async function updateName(userId, name) {
  if (!name) {
    throw ApiError.badRequest();
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('No such user');
  }

  user.name = name;
  await user.save();
  return user;
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) {
    throw ApiError.badRequest('Old password is incorrect')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  const { name, email } = user;
  return { name, email };
}

async function changeEmail(userId, newEmail, password) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw ApiError.badRequest('Incorrect password');
  }

  const repeteadEmail = await User.findOne({ where: { email: newEmail, id: { [Op.ne]: userId } } });

  if (repeteadEmail) {
    throw ApiError.badRequest('Validation error', {
      email: 'This email is already in use.'
    });
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();
  await emailService.sendNotificationEmail(oldEmail);
}

export const userServices = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updateName,
  changePassword,
  changeEmail
}
