'use strict';

const { Token } = require('./models/token');
// const { User } = require('./models/user');

Token.sync({ force: true });
// User.sync({ force: true });
