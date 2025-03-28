const { verify } = require('../services/jwt.service.js');

const nonAuthMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (authorization || token) {
    res.sendStatus(403);

    return;
  }

  const userData = verify(token);

  if (userData) {
    res.sendStatus(403);

    return;
  }

  next();
};

module.exports = {
  nonAuthMiddleware,
};
