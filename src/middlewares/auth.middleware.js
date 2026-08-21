const tokenService = require('../services/token.service');
const authService = require('../services/auth.service');

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({
      message: 'Authentication required',
    });
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).send({
      message: 'Invalid authorization header',
    });
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    const user = await authService.findById(payload.userId);

    if (!user) {
      return res.status(401).send({
        message: 'User not found',
      });
    }

    req.user = user;

    return next();
  } catch {
    return res.status(401).send({
      message: 'Invalid or expired token',
    });
  }
};

module.exports = {
  authMiddleware,
};
