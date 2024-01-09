'use strict';

require('dotenv/config');

const { User } = require('./models/user.js');
const { client } = require('./utils/db.js');

client.sync({ force: true });
