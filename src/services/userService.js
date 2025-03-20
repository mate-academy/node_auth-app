import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

async function register({ email, password, name }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hash,
    name,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

async function reqPwdReset(email) {
  const pwdResetToken = uuidv4();
  const user = await getByEmail(email);

  user.pwdResetToken = pwdResetToken;
  await user.save();
  emailService.sendResetEmail(email, pwdResetToken);
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

  user.save();
}

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  reqPwdReset,
  update,
};

uuidv4();
