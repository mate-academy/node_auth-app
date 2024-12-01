require('dotenv').config();

const { client } = require('./src/utils/db.js');
const { User } = require('./src/models/user.js');

client.sync({ force: true });
