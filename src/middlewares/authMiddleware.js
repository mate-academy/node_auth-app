const jwtService = require('../services/jwtService.js');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.sendStatus(401);
  }

  next();
};

module.exports = {
  authMiddleware,
};
