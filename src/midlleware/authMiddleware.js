const { jwtService } = require('../services/jwt.service');
const { User } = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = req.cookies.accessToken || authorization.replace('Bearer ', '');

  if (!token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.sendStatus(401);
  }

  const user = await User.findByPk(userData.id);

  if (!user) {
    return res.sendStatus(401);
  }

  if (user.activationToken !== null) {
    return res.status(403).send('Email is not activated');
  }

  req.user = user;

  next();
};

module.exports = { authMiddleware };
