'use strict';
// import crypto from 'crypto';
import { User } from '../models/userModel.js';

const getAll = async () => {
  const result = await User.findAll();

  return result;
};

const getById = async (id) => {
  return User.findByPk(id);
};

const normalize = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    activated: user.activated,
  };
};

const getByActivationToken = async (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const getByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const create = async ({ name, email, password, activated }) => {
  const activationToken = crypto.randomBytes(32).toString('hex');
  // const activationToken = hashToken(rawActivationToken);

  // const rawResetToken = crypto.randomBytes(32).toString('hex');
  // const resetToken = hashToken(rawResetToken);
  return User.create({
    name,
    email,
    password,
    activationToken,
    activated,
  });
};

const activateUserByToken = async ({ activationToken }) => {
  return User.update(
    {
      activated: true,
      activationToken: null,
      activatedAt: new Date(),
    },
    {
      where: { activationToken },
    },
  );
};

// const updateActivated = async (activationToken) => {
//   // Find the user first
//   const user = await getByActivationToken(activationToken);

//   if (!user) return null; // No matching user

//   // Update the user
//   await user.update({
//     activated: true,
//     activationToken: null,
//     activatedAt: new Date(),
//   });

//   // Return user ID for redirect
//   return { id: user.id };
// };

// const remove = async (id) => {
//   return User.destroy({ where: { id } });
// };

export const userService = {
  getAll,
  getById,
  normalize,
  create,
  // update,
  getByActivationToken,
  activateUserByToken,
  getByEmail,
  // remove,
};
