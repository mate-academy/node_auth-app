import { db } from '../utils/db.js';

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  activationToken?: string | null;
  pendingEmail?: string | null;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
}

const getById = async (id: string) => {
  return db.user.findUnique({
    where: { id },
  });
};

const getByEmail = async (email: string) => {
  return db.user.findUnique({
    where: { email },
  });
};

const getByActivationToken = async (activationToken: string) => {
  return db.user.findFirst({
    where: { activationToken },
  });
};

const getByResetToken = async (resetToken: string) => {
  return db.user.findFirst({
    where: { resetToken },
  });
};

const create = async (
  name: string,
  email: string,
  password: string,
  activationToken?: string,
) => {
  return db.user.create({
    data: {
      name,
      email,
      password,
      activationToken,
    },
  });
};

const update = async (id: string, data: UpdateUserData) => {
  return db.user.update({
    where: { id },
    data,
  });
};

export const usersRepository = {
  create,
  getById,
  getByEmail,
  getByActivationToken,
  getByResetToken,
  update,
};
