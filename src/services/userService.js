'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const { User } = require('../models/user');
const emailService = require('../services/emailService');
const { ApiError } = require('../exceptions/apiError');

const getAllActive = () => {
  return User.findAll({
    where: { activationToken: null },
  });
};

const getByEmail = (email) => {
  return User.findOne({
    where: { email },
  });
};

const getById = (id) => {
  return User.findOne({
    where: { id },
  });
};

const normalize = ({ id, email, name, withGoogle }) => {
  return {
    id, email, name, withGoogle,
  };
};

const register = async(email, password, name) => {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
};

const registerWithGoogle = async(email, password, name) => {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exists');
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    withGoogle: true,
  });
};

const generateRestoreCode = () => {
  const min = 100000;
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  getById,
  generateRestoreCode,
  registerWithGoogle,
};
