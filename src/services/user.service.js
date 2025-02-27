import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function getOne(id) {
  return User.findOne({ where: { id } });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  User.findOne({ where: { email } });
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
    name,
    activationToken,
  });
  await emailService.sendActivatoinEmail(email, activationToken);
}

async function reqPwdReset(email) {
  const pwdResetToken = uuidv4();
  const user = await findByEmail(email);

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
  getAllActivated,
  getOne,
  normalize,
  findByEmail,
  register,
  reqPwdReset,
  update,
};
