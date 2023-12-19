'use strict';

require('dotenv/config');
require('./models/user.js');
require('./models/token.js');

const { sequelize } = require('./utils/db.js');

sequelize.sync({ force: true });
