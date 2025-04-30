import { db } from '../utils/db.js';
import { User } from '@prisma/client';

function getById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

function getByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

function create(name: string, email: string, password: string): Promise<User> {
  return db.user.create({ data: { name, email, password } });
}

function changeName(email: string, newName: string) {
  return db.user.update({
    where: { email },
    data: { name: newName },
  });
}

function changePassword(email: string, newPassword: string) {
  return db.user.update({
    where: { email },
    data: { password: newPassword },
  });
}

function changeEmail(id: string, newEmail: string) {
  return db.user.update({
    where: { id },
    data: { email: newEmail },
  });
}

export const userRepository = {
  getById,
  getByEmail,

  create,
  changeName,
  changeEmail,
  changePassword,
};
