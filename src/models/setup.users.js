'use strict';

const { User } = require('./user');

User.sync({ force: true });
