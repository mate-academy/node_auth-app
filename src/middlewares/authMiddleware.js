const jwtService = require('../services/jwt.service.js');

const authMiddleware = (req, res) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  req.user = userData;

  next();
};

module.exports = authMiddleware;
