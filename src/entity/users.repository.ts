import { db } from '../utils/db.js';

function getByEmail(email: string) {
  return db.user.findFirst({
    where: { email },
  });
}

function create(
  email: string,
  passwordHash: string,
  name: string,
  activationToken: string,
) {
  return db.user.create({
    data: {
      email,
      password: passwordHash,
      name,
      activationToken,
    },
  });
}

function activate(email: string) {
  return db.user.update({
    where: { email },
    data: { activationToken: null },
  });
}

function updatePassword(email: string, passwordHash: string) {
  return db.user.update({
    where: { email },
    data: { password: passwordHash },
  });
}

function updateProfile(id: string, data: { name?: string; email?: string }) {
  return db.user.update({
    where: { id },
    data,
  });
}

function getByResetToken(resetToken: string) {
  return db.user.findFirst({
    where: { resetToken },
  });
}

function getAllActive() {
  return db.user.findMany({
    where: {
      activationToken: null,
    },
  });
}

function updateResetToken(email: string, resetToken: string | null) {
  return db.user.update({
    where: { email },
    data: { resetToken },
  });
}

export const usersRepository = {
  getByEmail,
  create,
  activate,
  updatePassword,
  updateProfile,
  getByResetToken,
  updateResetToken,
  getAllActive,
};
