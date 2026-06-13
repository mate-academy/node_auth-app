const { verifyAccessToken } = require('../utils/jwt.js');

const isGuest = (req, res, next) => {
  const { accessToken } = req.cookies;

  if (verifyAccessToken(accessToken)) {
    return res.redirect(process.env.CLIENT_HOST + '/profile');
  }

  next();
};

module.exports = {
  isGuest,
};
