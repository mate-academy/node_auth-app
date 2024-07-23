const { ApiError } = require('../exceptions/API-error.js');

const guestMiddleware = (req, res, next) => {
  const auth = req.headers?.authorization;

  if (auth) {
    throw ApiError.Unauthorized();
  }

  next();
};

module.exports = { guestMiddleware };
