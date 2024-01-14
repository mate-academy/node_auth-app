'use strict';

require('dotenv/config');

const { client } = require('./utils/db.js');

client.sync({ force: true });
