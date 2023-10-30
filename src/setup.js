'use strict';
require('dotenv').config();

const { User } = require('./models/user');
const { Token } = require('./models/token');

User.sync({ force: true });
Token.sync({ force: true });
