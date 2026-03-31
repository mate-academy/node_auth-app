'use strict';

export const guestMiddleware = (req, res, next) => {
  if (req.signedCookies?.userId) {
    return res.status(403).json({ message: 'You are already authenticated' });
  }

  next();
};
