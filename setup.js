/*eslint-disable*/
const env = require('dotenv/config');

const { User } = require('./src/models/User.js');
const { Token } = require('./src/models/Token.js');

const { client } = require('./src/utils/db.js');

client.sync({ force: true });