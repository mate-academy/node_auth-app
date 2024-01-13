'use strict';

require('dotenv/config');

// eslint-disable-next-line no-unused-vars
const { User } = require('./models/user.js');
const { client } = require('./utils/db.js');

client.sync({ force: true });
