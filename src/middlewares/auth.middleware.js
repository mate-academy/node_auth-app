// const { Request, Response, NextFunction } = require('express');
const { jwt } = require('./../service/jwt.service.js');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = userData;
  next();
}

module.exports = {
  authMiddleware,
};
