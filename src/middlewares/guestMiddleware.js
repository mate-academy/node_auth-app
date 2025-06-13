const { jwtService } = require('../services/jwt.service');

const guestMiddleware = (req, res, next) => {
  const auth = req.headers['authorization'] || '';
  const [, token] = auth.split(' ');

  if (token && jwtService.verify(token)) {
    return res.status(403).json({
      message: 'This page is only available to unauthenticated users.',
    });
  }

  next();
};

module.exports = { guestMiddleware };
