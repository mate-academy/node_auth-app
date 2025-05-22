// import nodemailer from 'nodemailer';
import 'dotenv/config';
import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function getOne(id) {
  return User.findOne({ where: { id } });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password, name) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    email,
    password,
    activationToken,
    name,
  });
  await emailService.sendActivationLink(email, activationToken);
}

async function update(
  id,
  name = undefined,
  password = undefined,
  email = undefined,
) {
  const user = await User.findOne({ where: { id } });

  if (name) {
    user.name = name;
  }

  if (password) {
    const hashedPass = await bcrypt.hash(password, 10);

    user.password = hashedPass;
  }

  if (email) {
    user.email = email;
  }

  await user.save();
}

async function reqPwdReset(email) {
  const pwdResetToken = uuidv4();
  const user = await findByEmail(email);

  user.pwdResetToken = pwdResetToken;
  await user.save();

  await emailService.sendResetEmail(email, pwdResetToken);
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  getOne,
  update,
  reqPwdReset,
};
