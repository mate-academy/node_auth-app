import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/user.js';

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

function normalize({ id, name, email }) {
  return { id, name, email };
}

async function register({ name, email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name, 
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
};

async function resetPassword({email}) {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound("No such user");
  };

  const resetToken = uuidv4();
  user.resetPasswordToken = resetToken;

  await emailService.sendResetPasswordLink(email, resetToken);
  await user.save();

}

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  resetPassword
};

uuidv4();
