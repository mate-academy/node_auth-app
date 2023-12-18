'use strict';

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const generateActivationToken = () => {
  return uuidv4();
};

const createAccessToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET);
};

const readAccessToken = (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

exports.tokenService = {
  generateActivationToken,
  createAccessToken,
  readAccessToken,
};
