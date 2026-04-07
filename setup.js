/* eslint-disable no-unused-vars */
require('dotenv').config();

const { User } = require('./src/models/user');
const { Token } = require('./src/models/token');
const { client } = require('./src/utils/db');

client.sync({ force: true });
