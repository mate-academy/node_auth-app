'use strict';

const session = require('express-session');
const connectSessionSequelize = require('connect-session-sequelize');
const config = require('../config');
const { sequelize } = require('../models');

const SequelizeStore = connectSessionSequelize(session.Store);

// Sessions live in the database (table "Sessions"), not in memory.
const sessionStore = new SequelizeStore({ db: sequelize });

const sessionMiddleware = session({
  name: 'sid',
  secret: config.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: config.trustProxy,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.baseUrl.startsWith('https'),
    maxAge: config.sessionTtl,
  },
});

module.exports = {
  sessionMiddleware,
  sessionStore,
};
