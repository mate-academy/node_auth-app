const { jwtService } = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.senStatus(401);

    return;
  }

  const usetData = jwtService.verify(token);

  if (!usetData) {
    res.senStatus(401);

    return;
  }

  next();
};

module.exports = { authMiddleware };
