'use strict';

const express = require('express');

const { authRouter } = require('./auth.routes');
const { profileRouter } = require('./profile.routes');

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);

module.exports = { apiRouter };
