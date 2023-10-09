'use strict';

require('dotenv').config();

// eslint-disable-next-line no-unused-vars
const { User } = require('./src/models/user');
const { client } = require('./src/utils/db');

client.sync({ force: true });
