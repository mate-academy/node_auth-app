const tokenService = require('../services/token.service');

const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return next();
  }

  try {
    tokenService.verifyAccessToken(token);

    return res.status(403).send({
      message: 'This route is available only for unauthenticated users',
    });
  } catch {
    return next();
  }
};

module.exports = {
  guestMiddleware,
};
