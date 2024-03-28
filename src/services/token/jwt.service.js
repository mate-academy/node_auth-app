'use strict';

const jwt = require('jsonwebtoken');

const { Tokens } = require('../../libs/enums/enums.js');

class JwtService {
  constructor() {
    this.payloadDataKeys = {
      [Tokens.ACCESS_TOKEN]: 'userData',
      [Tokens.REFRESH_TOKEN]: 'userData',
      [Tokens.NEW_EMAIL_TOKEN]: 'emailData',
    };

    this.expirySeconds = {
      [Tokens.ACCESS_TOKEN]: process.env.JWT_ACCESS_EXPIRY,
      [Tokens.REFRESH_TOKEN]: process.env.JWT_REFRESH_EXPIRY,
      [Tokens.NEW_EMAIL_TOKEN]: process.env.JWT_NEW_EMAIL_EXPIRY,
    };

    this.secrets = {
      [Tokens.ACCESS_TOKEN]: process.env.JWT_ACCESS_SECRET,
      [Tokens.REFRESH_TOKEN]: process.env.JWT_REFRESH_SECRET,
      [Tokens.NEW_EMAIL_TOKEN]: process.env.JWT_NEW_EMAIL_SECRET,
    };
  }

  generateJwtToken(tokenType, tokenPayload) {
    const payloadDataKey = this.payloadDataKeys[tokenType];
    const exp = this.getExp(tokenType);
    const secret = this.secrets[tokenType];

    return jwt.sign(
      {
        [payloadDataKey]: tokenPayload,
        exp,
      },
      secret,
    );
  }

  validateJwtToken(tokenType, token) {
    try {
      const payloadDataKey = this.payloadDataKeys[tokenType];
      const secret = this.secrets[tokenType];

      const payload = jwt.verify(token, secret);

      if (payload) {
        return payload[payloadDataKey];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  getExp(tokenType) {
    const expirySeconds = parseInt(this.expirySeconds[tokenType]);

    return Math.floor(Date.now() / 1000) + expirySeconds;
  }
};

module.exports = {
  JwtService,
};
