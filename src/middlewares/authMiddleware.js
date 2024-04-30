'use strict';

const { ApiError } = require('../exeption/apiError.js');
const jwtServices = require('../services/jwtServices.js');
const { findByEmail } = require('../services/userServices.js');
const validate = require('../utils/validate.js');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtServices.verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};

const validRegMiddlewere = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validate.email(email),
    password: validate.password(password),
    name: validate.username(name),
  };

  if (!errors.email || !errors.password || !errors.name) {
    throw ApiError.badRequest('Bad requst', errors);
  };

  const isNotNewEmail = findByEmail(email);

  if (isNotNewEmail) {
    throw ApiError.badRequest('Bad requst', errors);
  };

  next();
};

module.exports = {
  authMiddleware,
  validRegMiddlewere,
};
