'use strict';
import { User } from "../controllers/db/models/user.model.js";

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

const normalizeUserData = ({
  id,
  name,
  email,
  createdAt,
  verified,
}) => ({
  id,
  name,
  email,
  createdAt,
  verified,
});

const getAllUsers = () => {
  return User.findAll({
    order: ['name'],
  });
};

const createUser = ({
  name,
  password,
  email,
  secretToken,
 }) => {
  return User.create({
    name,
    password,
    email,
    secretToken,
  });
};

const getUserById = ({id}) => {
  return User.findByPk(id);
};

const getUserByEmail = (email) => {
  return User.findOne({
    where: { email }
  });
};

const getUserBySecretToken = (secretToken) => {
  return User.findOne({
    where: { secretToken }
  });
};

const deleteUserById = (id) => {
  return User.destroy({
    where: {
      id,
    },
  });
};


const updateUserById = ({id, name, password}) => {
  if (name) {
    return User.update({
      name,
    }, {
      where: {
        id,
      },
    });
  }

  if (password) {
    return User.update({
      password,
    }, {
      where: {
        id,
      },
    });
  }
};

export const usersService = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUserById,
  updateUserById,
  normalizeUserData,
  getUserByEmail,
  getUserBySecretToken,
};
