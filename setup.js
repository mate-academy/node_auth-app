/* eslint-disable no-unused-vars */
require('dotenv/config');

const { User } = require('./src/models/User.model');
const { Token } = require('./src/models/Token.model');
const { client } = require('./src/db');

client.sync({ force: true });
