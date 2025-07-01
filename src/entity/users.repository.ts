import { db } from '../utils/db.js';

function create(
  email: string,
  password: string,
  activationToken?: string,
  name?: string,
) {
  return db.user.create({
    data: {
      email,
      password,
      activationToken,
      name,
    },
  });
}

function getByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

function getById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}

function activate(email: string) {
  return db.user.update({
    where: { email },
    data: {
      activationToken: null,
      isActive: true,
    },
  });
}

function updateName(id: string, name: string) {
  return db.user.update({
    where: { id },
    data: { name },
  });
}

function updateEmail(id: string, email: string) {
  return db.user.update({
    where: { id },
    data: { email },
  });
}

function updatePassword(id: string, password: string) {
  return db.user.update({
    where: { id },
    data: { password },
  });
}

function setResetToken(email: string, resetToken: string, expiry: Date) {
  return db.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry: expiry,
    },
  });
}

function resetPassword(email: string, password: string) {
  return db.user.update({
    where: { email },
    data: {
      password,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}

function getAllActive() {
  return db.user.findMany({
    where: { isActive: true },
  });
}

export const usersRepository = {
  create,
  getByEmail,
  getById,
  activate,
  updateName,
  updateEmail,
  updatePassword,
  setResetToken,
  resetPassword,
  getAllActive,
};
