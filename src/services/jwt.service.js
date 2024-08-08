const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const ApiError = require('../exeptions/api.error');

dotenv.config();

function isPlainObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

function sign(user) {
  if (!isPlainObject(user)) {
    throw ApiError.BadRequest('Payload for JWT must be a plain object');
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: '1h',
  });

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    throw ApiError.Unauthorized(
      'Access token verification failed: ' + error.message,
    );
  }
}

function signRefresh(user) {
  if (!isPlainObject(user)) {
    throw ApiError.BadRequest('Payload for JWT must be a plain object');
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    expiresIn: '7d',
  });

  return token;
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    throw ApiError.Unauthorized(
      'Refresh token verification failed: ' + error.message,
    );
  }
}

function signResetToken(user) {
  if (!isPlainObject(user)) {
    throw ApiError.BadRequest('Payload for JWT must be a plain object');
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: '1h',
  });

  return token;
}

module.exports = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  signResetToken,
};
