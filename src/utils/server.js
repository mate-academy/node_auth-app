/* eslint-disable no-console */
'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');

const { sequelize } = require('./db.js');

const createServer = (PORT) => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.listen(PORT, () => {
    sequelize
      .authenticate()
      .then(() => console.log('Database ON'))
      .catch(() => console.log('Could not connect database'));
    console.log(`Listening on port ${PORT}`);
  });

  return app;
};

module.exports = {
  createServer,
};
