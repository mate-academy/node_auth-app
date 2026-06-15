const jwt = require('./jwt.js');

const updateAccessToken = (res, payload) => {
  const newToken = jwt.getAccessToken(payload);

  res.cookie('accessToken', newToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

module.exports = updateAccessToken;
