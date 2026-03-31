'use strict';

export const authMiddleware = (req, res, next) => {
  const userId = req.signedCookies?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = { id: userId };
  next();
};
