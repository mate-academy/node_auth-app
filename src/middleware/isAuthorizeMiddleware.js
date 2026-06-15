const { verifyAccessToken } = require('../utils/jwt.js');

const isAuthorize = (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken || !verifyAccessToken(accessToken)) {
    return res.redirect(process.env.CLIENT_HOST + '/auth/login');
  }

  next();
};

module.exports = {
  isAuthorize,
};
