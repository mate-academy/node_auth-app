/* eslint-disable no-unused-vars */
require('dotenv').config();

const { Token } = require('./models/Token.js');
const { User } = require('./models/User.js');
const { dbClient } = require('./utils/db');

dbClient.sync({ force: true });
