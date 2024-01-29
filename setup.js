'use strict';

const { User } = require('./bd');
const { client } = require('../utils/bd');

User.sync({ force: true });
