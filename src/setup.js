'use strict';

const { sequelize } = require('./utils/db');

// eslint-disable-next-line no-unused-vars
const { Token } = require('./models/token-model');

// eslint-disable-next-line no-unused-vars
const { User } = require('./models/user-model');

sequelize.sync();
