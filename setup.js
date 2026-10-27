require('dotenv/config');

// const { User } = require('./src/models/user.js');
// import { Token } from './src/models/token.js';

const { client } = require('./src/utils/db.js');

client.sync({ force: true });
