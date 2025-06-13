const { jwtService } = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
  const auth = req.headers['authorization'] || '';

  const [, token] = auth.split(' ');

  if (!auth || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};

module.exports = { authMiddleware };
