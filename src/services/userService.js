'use strict';

const { v4: uuidv4 } = require('uuid');

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

const normalize = ({ id, email }) => {
  return {
    id, email,
  };
};

const register = async(email, password) => {
  const activationToken = uuidv4();
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken',
    });
  }

  await User.create({
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
};

module.exports = {
  getAllActive, normalize, getByEmail, register,
};
