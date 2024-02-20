/* eslint-disable no-unused-vars */
'use strict';

const { client } = require('./utils/db');
const { User } = require('./models/User');
const { Token } = require('./models/Token');

require('dotenv').config();

client.sync({ force: true });
