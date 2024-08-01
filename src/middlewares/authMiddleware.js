const { ApiError } = require('../exceptions/api.error.js');
const { jwtService } = require('../services/jwt.service.js');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized({
      email: 'User unauthorized',
    });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};

module.exports = { authMiddleware };
