'use strict';

const { User } = require('../models/user-model');
const bcrypt = require('bcrypt');
const {
  sendActivationEmail,
  sendPasswordResetEmail,
} = require('./mail-service');
const nodeCrypto = require('node:crypto');

const createUser = async (user) => {
  const userEmail = await User.findOne({
    where: {
      email: user.email,
    },
  });

  if (userEmail) {
    throw new Error('O email informado já existe');
  }

  const password = await bcrypt.hash(user.password, 10);

  const activationToken = nodeCrypto.randomBytes(16);
  const token = activationToken.toString('hex');

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const isUsed = false;

  const data = await User.create({
    ...user,
    password,
    token,
    expiresAt,
    isUsed,
    isActive: false,
  });

  try {
    await sendActivationEmail(user.email, token);
  } catch (error) {
    try {
      await data.destroy();
    } catch (deleteError) {
      throw new Error(
        'Erro ao excluir usuário após falha no envio do email:',
        deleteError,
      );
    }

    throw new Error('Houve um erro ao enviar o email de ativação de conta.');
  }

  return data;
};

const activateUser = async (user) => {
  const userInformations = await User.findOne({
    where: {
      token: user.token,
    },
  });

  if (userInformations === null) {
    return null;
  }

  if (userInformations.isUsed === true) {
    return null;
  }

  const time = new Date().getTime();
  const expiresAt = new Date(userInformations.expiresAt).getTime();

  if (time > expiresAt) {
    return null;
  }

  const userActivate = await userInformations.update({
    isActive: true,
    isUsed: true,
  });

  return userActivate;
};

const loginUser = async (user) => {
  const userEmail = await User.findOne({
    where: {
      email: user.email,
    },
  });

  if (!userEmail) {
    return null;
  }

  const userPassword = await bcrypt.compare(user.password, userEmail.password);

  if (!userPassword) {
    return null;
  }

  if (!userEmail.isActive) {
    throw new Error('CONTA_NAO_ATIVADA');
  }

  const { password, ...safeUser } = userEmail.toJSON();

  return safeUser;
};

const getUserId = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  };
};

const sendPasswordResetInstructions = async (user) => {
  const userEmail = await User.findOne({
    where: {
      email: user.email,
    },
  });

  if (!userEmail) {
    return null;
  }

  const redefineToken = nodeCrypto.randomBytes(16);
  const token = redefineToken.toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const data = await userEmail.update({
    passwordResetToken: token,
    passwordResetExpiresAt: expiresAt,
  });

  await sendPasswordResetEmail(user.email, token);

  return data;
};

const resetPasswordWithToken = async (user) => {
  const redefineToken = await User.findOne({
    where: {
      passwordResetToken: user.token,
    },
  });

  if (!redefineToken) {
    throw new Error('TOKEN_INVALIDO_OU_AUSENTE');
  }

  if (!redefineToken.passwordResetExpiresAt) {
    await redefineToken.update({
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });

    return null;
  }

  const expiresTimeToken = redefineToken.passwordResetExpiresAt.getTime();
  const time = new Date().getTime();

  if (time > expiresTimeToken) {
    await redefineToken.update({
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });

    return null;
  }

  if (typeof user.password !== 'string' || user.password.length < 6) {
    throw new Error('SENHA_CURTA');
  }

  if (typeof user.confirmation !== 'string') {
    throw new Error('SENHA_INCORRETA');
  }

  if (user.password !== user.confirmation) {
    throw new Error('SENHA_INCORRETA');
  }

  const password = await bcrypt.hash(user.password, 10);

  const newPassword = await redefineToken.update({
    password: password,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
  });

  return newPassword;
};

const updateUserName = async (userId, newName) => {
  const user = await User.findByPk(userId);

  if (!user) {
    return null;
  }

  const userUpdate = await user.update({
    name: newName,
  });

  return userUpdate;
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    return null;
  }

  const userPassword = await bcrypt.compare(currentPassword, user.password);

  if (!userPassword) {
    return null;
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  const passwordUpdated = await user.update({
    password: hashPassword,
  });

  return passwordUpdated;
};

module.exports = {
  createUser,
  activateUser,
  loginUser,
  getUserId,
  sendPasswordResetInstructions,
  resetPasswordWithToken,
  updateUserName,
  changeUserPassword,
};
