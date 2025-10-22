const jwt = require('jsonwebtoken');

const onlyGuest = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);

      return res.status(403).json({ message: 'Already logged in' });
    } catch (err) {
      // токен недійсний → можна продовжувати
    }
  }
  next();
};

module.exports = { onlyGuest };
