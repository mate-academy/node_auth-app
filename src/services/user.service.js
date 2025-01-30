import { User } from '../models/user.model.js';

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

const create = (email, password, activationToken) => {
  return User.create({ email, password, activationToken });
};

const getAllActive = () => {
  return User.findAll({ where: { activationToken: null } });
};

export const userService = {
  validateEmail,
  validatePassword,
  create,
  getByEmail,
  getAllActive,
  normalize,
};
