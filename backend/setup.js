require('dotenv').config();

const { User } = require('./src/model/user');
const { Token } = require('./src/model/token');

const { client } = require('./src/utils/db');

client.sync({ force: true });
