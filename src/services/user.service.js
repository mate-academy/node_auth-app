import { Prisma } from '@prisma/client';
import { passwordStrength } from 'check-password-strength';
import bcrypt from 'bcrypt';
import { db } from '../utils/db.js';
import { v4 as uuid4 } from 'uuid';
import { mailerService } from '../services/mailer.service.js';
import { ApiError } from '../exceptions/Api.error.js';
import { jwtService } from './jwt.service.js';

const userModel = db.user;
// #region Validation functions

const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'At least 3 characters';
  }
};

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  const checkResult = passwordStrength(value);

  if (checkResult.id === 0) {
    return 'Password is ' + checkResult.value;
  }
};

const validators = {
  name: validateName,
  email: validateEmail,
  newEmail: validateEmail,
  password: validatePassword,
  currentPassword: validatePassword,
  confirmPassword: validatePassword,
};

function validateFields(validationFields) {
  const errors = {};

  for (const [field, value] of Object.entries(validationFields)) {
    const validator = validators[field];

    if (typeof validator !== 'function') {
      continue;
    }

    const err = validator(value);

    if (err) {
      errors[field] = err;
    }
  }

  return errors;
}

function verifyValidationErrors(errors, message = 'Validation error') {
  if (Object.values(errors).some(Boolean)) {
    throw ApiError.badRequest(message, errors);
  }
}

function validateOrThrow(values, message = 'Validation error') {
  const errors = validateFields(values);

  verifyValidationErrors(errors, message);

  return true;
}

// #endregion

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const {
    createdAt,
    password,
    activationToken,
    resetPasswordJti,
    ...safeUser
  } = user;

  return safeUser;
}

function create({ name, email, password, activationToken }) {
  return userModel.create({
    data: {
      name,
      email,
      password,
      activationToken,
    },
  });
}

function findAll(query) {
  return userModel.findMany({
    where: {
      ...query,
    },
  });
}

function findByEmail(email) {
  return userModel.findUnique({
    where: {
      email,
    },
  });
}

function findById(id) {
  return userModel.findUnique({
    where: {
      id,
    },
  });
}

function changeName(id, name) {
  // Validate provided name
  validateOrThrow({ name });

  return userModel.update({
    where: { id },
    data: { name },
  });
}

async function activateUserByToken(activationToken) {
  try {
    const user = await userModel.update({
      where: {
        activationToken,
      },
      data: {
        activationToken: null,
      },
    });

    return user;
  } catch (e) {
    return null;
  }
}

async function registration({ name, email, password }) {
  validateOrThrow({ name, email, password });

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists', {
      email: 'User with this email already exists',
    });
  }

  const activationToken = uuid4();
  const hashedPassword = await bcrypt.hash(password, 10);

  await userModel.create({
    data: {
      name,
      email,
      password: hashedPassword,
      activationToken,
    },
  });

  await mailerService.sendActivationLink(email, activationToken);
}

async function getResetPasswordJWT(email) {
  validateOrThrow({ email });

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest(`Can't find user with email ${email}`);
  }

  const id = user.id;

  const resetPasswordJti = uuid4();
  const resetPasswordJWT = await jwtService.signPasswordRequest(
    id,
    resetPasswordJti,
  );

  await userModel.update({
    where: { id },
    data: { resetPasswordJti },
  });
  await mailerService.sendResetPasswordLink(email, resetPasswordJWT);
}

async function resetPassword(jwt, newPassword) {
  const tokenData = await jwtService.verifyPasswordReset(jwt);

  if (!tokenData?.jti) {
    throw ApiError.badRequest('Bad jwt', { jwt: 'jti not found' });
  }

  const user = await userModel.findUnique({
    where: { resetPasswordJti: tokenData.jti },
  });

  if (!user) {
    throw ApiError.badRequest('User not found, try with new link!');
  }

  const updatedUser = await updatePassword(user.id, newPassword);

  if (updatedUser) {
    await userModel.update({
      where: { id: updatedUser.id },
      data: { resetPasswordJti: null },
    });
  }

  return updatedUser;
}

async function updatePassword(id, newPassword) {
  // Validate newPassword
  validateOrThrow({ newPassword });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return userModel.update({
    where: { id },
    data: { password: hashedPassword },
  });
}

async function changePassword({ id, currentPassword, newPassword }) {
  const user = await findById(id);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      currentPassword: 'Wrong password',
    });
  }

  return updatePassword(id, newPassword);
}

async function changeEmail(id, currentPassword, newEmail) {
  validateOrThrow({ currentPassword, newEmail });

  const user = await findById(id);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid current password', {
      currentPassword: 'Invalid password',
    });
  }

  try {
    const updatedUser = await userModel.update({
      where: { id },
      data: { email: newEmail },
    });

    await mailerService.sendUpdateEmail(user.email);

    return updatedUser;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw ApiError.badRequest('Bad request', {
        newEmail: `User with ${newEmail} already exists`,
      });
    } else {
      throw ApiError.badRequest('Bad request');
    }
  }
}

export const userService = {
  normalizeUser,
  validatePassword,
  validateEmail,
  getResetPasswordJWT,
  create,
  findAll,
  findByEmail,
  findById,
  changeName,
  activateUserByToken,
  registration,
  changePassword,
  changeEmail,
  resetPassword,
};
