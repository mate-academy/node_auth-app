'use strict';

const express = require('express');
const { catchErrorMW } = require('../middlewares/catchErrorMW.js');
const { googlePassport } = require('../utils/googlePassport.js');
const { createClientUrl } = require('../exceptions/createClientUrl.js');
const { ErrorApi } = require('../exceptions/ErrorApi.js');
const { userService } = require('../services/userService.js');

const googleRouter = new express.Router();

googleRouter.get('',
  catchErrorMW(googlePassport.authenticate(
    'google', { scope: ['profile', 'email'] },
  )),
);

googleRouter.get('/callback',
  googlePassport.authenticate('google', {
    failureRedirect: createClientUrl('/login'),
  }), (req, res) => {
    res.redirect(createClientUrl('/profile?loginMethod=google'));
  });

googleRouter.get('/success',
  catchErrorMW((req, res) => {
    if (req.user) {
      res.send({ user: userService.normalize(req.user) });
    } else {
      throw ErrorApi.Unauthorized();
    }
  }),
);

googleRouter.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }

    res.redirect(process.env.CLIENT_URL);
  });
});

module.exports = { googleRouter };
