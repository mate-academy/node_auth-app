'use strict';

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const generateToken = () => {
  return uuidv4();
};

const createAccessToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const readAccessToken = (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const createRefreshToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_REFRESH, { expiresIn: '30d' });
};

const readRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_REFRESH);
  } catch (error) {
    return null;
  }
};

exports.jwtService = {
  generateToken,
  createAccessToken,
  readAccessToken,
  createRefreshToken,
  readRefreshToken,
};
