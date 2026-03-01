/* eslint-disable max-len */

import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../utils/db.js';

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 4) {
    return 'Name must be at least 4 characters long';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/\d/.test(value)) {
    return 'Password must contain at least one number';
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
    return 'Password must contain at least one special character (e.g., !@#$%^&*)';
  }
}

async function getById(id) {
  return db.user.findUnique({
    where: { id },
  });
}

async function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

async function create(name, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = randomUUID();

  return db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      activationToken,
    },
  });
}

async function getByActivationToken(activationToken) {
  return db.user.findFirst({
    where: { activationToken },
  });
}

async function activate(id) {
  return db.user.update({
    where: { id },
    data: { activationToken: null },
  });
}

function normalize(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function getAllActive() {
  return db.user.findMany({
    where: { activationToken: null },
    orderBy: { id: 'asc' },
  });
}

async function updatePassword(id, newPassword) {
  return db.user.update({
    where: { id },
    data: { password: newPassword },
  });
}

async function updateName(id, name) {
  return db.user.update({
    where: { id },
    data: { name },
  });
}

async function updateEmail(id, newEmail, activationToken) {
  return db.user.update({
    where: { id },
    data: {
      email: newEmail,
      activationToken: activationToken,
    },
  });
}

export const userService = {
  validateName,
  validateEmail,
  validatePassword,
  getById,
  getByEmail,
  getByActivationToken,
  create,
  activate,
  normalize,
  getAllActive,
  updatePassword,
  updateName,
  updateEmail,
};
