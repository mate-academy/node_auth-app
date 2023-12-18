'use strict';

require('dotenv/config');
require('./models/user.js');

const { sequelize } = require('./utils/db.js');

sequelize.sync({ force: true });
