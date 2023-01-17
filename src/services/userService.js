'use strict';

const { User } = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const emailService = require('./emailService');
const { ApiError } = require('../exceptions/ApiError');

const getAllActive = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
    order: ['id'],
  });
};

const getByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

const register = async(name, email, password) => {
  const existingError = await getByEmail(email);

  if (existingError) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name, email, password: hash, activationToken,
  });

  await emailService.sendActivalionLink(email, activationToken);
};

const reset = async(email) => {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User with this email does not exist');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;

  await user.save();

  await emailService.sendPasswordResetLink(email, resetToken);
};

const normalize = ({ id, name, email }) => {
  return {
    id, name, email,
  };
};

module.exports = {
  getAllActive, getByEmail, register, normalize, reset,
};
