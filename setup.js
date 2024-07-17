/* eslint-disable no-unused-vars */
require('dotenv').config();

const { Token } = require('./src/models/token.js');
const { User } = require('./src/models/user.js');
const { client } = require('./src/utils/db');

client.sync({ force: true });
