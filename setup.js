require('dotenv/config');
const { client } = require('./src/utils/db.js');
const { User } = require('./src/models/user.js');
const { Token } = require('./src/models/token.js');

client.sync({ force: true });
