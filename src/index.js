'use strict';

require('dotenv').config();

const config = require('./config');
const app = require('./app');
const { User } = require('./models/User');

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${config.port}`);
});

module.exports = { app, User };
