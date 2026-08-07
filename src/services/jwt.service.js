'use strict';

const jwt = require('jsonwebtoken');

class JwtService {
  generate(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
  }

  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

const jwtService = new JwtService();

module.exports = {
  jwtService,
};
