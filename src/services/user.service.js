import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.module.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { tokenService } from './token.service.js';
import { jwtService } from './jwt.service.js';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function findById(id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  return user;
}

async function register({ name, email, password }) {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User with this email already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return user;
}

export async function activate(activationToken) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('Wrong activation link');
  }

  user.activationToken = null;
  await user.save();

  return user;
}

async function login(email, password) {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest(
      'User is not activated. Check your mail to activate',
    );
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }

  return user;
}

export async function resetPassword(resetToken, password, confirmPassword) {
  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  await tokenService.remove(user.id);

  return user;
}

export async function updateProfile(userId, data) {
  const {
    name,
    oldPassword,
    newPassword,
    confirmPassword,
    password,
    email,
    confirmEmail,
  } = data;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (name) {
    user.name = name;
  }

  if (oldPassword && newPassword && confirmPassword) {
    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid current password');
    }

    user.password = await bcrypt.hash(newPassword, 10);
  }

  let sendEmails = false;
  let oldEmail = null;

  if (email && confirmEmail && password) {
    if (email !== confirmEmail) {
      throw ApiError.badRequest('Emails do not match');
    }

    const isPasswordValidEmail = await bcrypt.compare(password, user.password);

    if (!isPasswordValidEmail) {
      throw ApiError.unauthorized('Invalid password');
    }

    oldEmail = user.email;
    user.email = email;
    sendEmails = true;
  }

  await user.save();

  const accessToken = jwtService.sign(
    { id: user.id, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: '15m' },
  );

  if (sendEmails) {
    await emailService.send({
      email: oldEmail,
      subject: 'Your email was changed',
      html: `
        <h2>Email Change Notification</h2>
        <p>Hello ${user.name || ''},</p>
        <p>Your account email has been changed to: <b>${user.email}</b>.</p>
        <p>If you did not request this change, contact support immediately.</p>
      `,
    });

    await emailService.send({
      email: user.email,
      subject: 'Email change successful',
      html: `
        <h2>Welcome, ${user.name || ''}!</h2>
        <p>Your email has been successfully updated to this address.</p>
        <p>If you did not make this change, contact support immediately.</p>
      `,
    });
  }

  return { user: user.toJSON(), accessToken };
}

export async function requestPasswordReset(email) {
  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null;
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetPasswordEmail(email, resetToken);

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  activate,
  findById,
  login,
  resetPassword,
  updateProfile,
  requestPasswordReset,
};
