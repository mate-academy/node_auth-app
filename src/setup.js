'use strict';

const { db } = require('./utils/db.js');
// const { Token } = require('./models/Token.js');
// const { User } = require('./models/User.js');

db.sync({ force: true });
// User.sync({ force: true });
// Token.sync({ force: true });
