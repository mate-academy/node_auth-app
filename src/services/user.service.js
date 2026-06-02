import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { mailer } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findActivatedById(id) {
  return User.findOne({
    where: {
      id,
      activationToken: null,
    },
  });
}

function findByActivationToken(activationToken) {
  return User.findOne({ where: { activationToken } });
}

function findByResetPasswordToken(resetPasswordToken) {
  return User.findOne({ where: { resetPasswordToken } });
}

function findByEmailChangeToken(emailChangeToken) {
  return User.findOne({ where: { emailChangeToken } });
}

function normalize({ id, email }) {
  return { id, email };
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await mailer.sendActivationEmail(email, activationToken);
}

async function sendResetMessage(email) {
  const resetPasswordToken = uuidv4();

  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('User does not exist, please sign up', {
      email: 'User does not exist',
    });
  }

  await User.update({ resetPasswordToken }, { where: { email } });

  await mailer.sendResetPasswordEmail(email, resetPasswordToken);
}

async function changePassword(email, password) {
  await User.update({ password }, { where: { email } });
}

async function changeName(email, name) {
  await User.update({ name }, { where: { email } });
}

async function changeEmail(oldEmail, newEmail) {
  const existingUser = await findByEmail(newEmail);

  if (existingUser) {
    throw ApiError.badRequest('this email is exist', {
      email: 'this email is exist',
    });
  }

  const emailChangeToken = uuidv4();

  await mailer.sendChangeEmail(newEmail, emailChangeToken);
  await mailer.sendNotifyEmail(oldEmail);

  await User.update(
    {
      pendingEmail: newEmail,
      emailChangeToken,
    },
    {
      where: { email: oldEmail },
    },
  );
}

export const userService = {
  normalize,
  findByEmail,
  findActivatedById,
  findByActivationToken,
  findByResetPasswordToken,
  findByEmailChangeToken,
  register,
  sendResetMessage,
  changePassword,
  changeName,
  changeEmail,
};
