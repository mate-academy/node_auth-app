import { client } from '../utils/db';

function create(name: string, email: string, password: string, activationToken?: string) {
  return client.user.create({
    data: { name, email, password, activationToken },
  });
}

function getByEmail(email: string) {
  return client.user.findUnique({
    where: { email },
  });
}

function activate(email: string) {
  return client.user.update({
    where: { email },
    data: {
      isActivated: true,
      activationToken: null,
    },
  });
}

function getAll() {
  return client.user.findMany();
}

function getAllActive() {
  return client.user.findMany({
    where: { activationToken: null },
  });
}

function setResetPasswordToken(
  email: string,
  resetPasswordToken: string,
  resetPasswordExpires: Date,
) {
  return client.user.update({
    where: { email },
    data: {
      resetPasswordToken,
      resetPasswordExpires,
    },
  });
}

function getByResetPasswordToken(resetPasswordToken: string) {
  return client.user.findFirst({
    where: { resetPasswordToken },
  });
}

function updatePassword(userId: string, password: string) {
  return client.user.update({
    where: { id: userId },
    data: {
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
}

function updateEmail(id: string, email: string) {
  return client.user.update({
    where: { id },
    data: { email },
  });
}

function getById(id: string) {
  return client.user.findUnique({
    where: { id },
  });
}

function updateName(id: string, name: string) {
  return client.user.update({
    where: { id },
    data: { name },
  });
}

export const usersRepository = {
  create,
  getAll,
  getByEmail,
  activate,
  setResetPasswordToken,
  getByResetPasswordToken,
  updatePassword,
  getAllActive,
  updateEmail,
  getById,
  updateName,
};
