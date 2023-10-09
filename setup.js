/* eslint-disable no-unused-vars */
'use strict';

require('dotenv').config();

const { Token } = require('./src/models/token');
const { User } = require('./src/models/user');
const { client } = require('./src/utils/db');

client.sync({ force: true });
