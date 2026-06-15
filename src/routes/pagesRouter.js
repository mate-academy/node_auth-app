const express = require('express');
const jwt = require('../utils/jwt.js');

const pagesRouter = express.Router();

pagesRouter.get('/', (req, res) => {
  const { accessToken } = req.cookies;
  const authorized = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('homePage', { isAuthorize: authorized });
});

pagesRouter.get('/send-message', (req, res) => {
  const { accessToken } = req.cookies;
  const authorized = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('showMessage', {
    isAuthorize: authorized,
    message: 'A message has been sent to your email.',
  });
});

module.exports = {
  pagesRouter,
};
