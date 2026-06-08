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

function findOrCreateOAuthUser(data: {
  email: string;
  name?: string;
  googleId?: string;
  facebookId?: string;
  githubId?: string;
}) {
  return client.user.upsert({
    where: { email: data.email },
    update: {
      googleId: data.googleId,
      facebookId: data.facebookId,
      githubId: data.githubId,
      isActivated: true,
      activationToken: null,
    },
    create: {
      email: data.email,
      name: data.name || data.email,
      password: null,
      googleId: data.googleId,
      facebookId: data.facebookId,
      githubId: data.githubId,
      isActivated: true,
      activationToken: null,
    },
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
  findOrCreateOAuthUser
};
