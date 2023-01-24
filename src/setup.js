'use strict';

const { sequelize } = require('./utils/db');

require('dotenv/config');
require('./models/User');
require('./models/Token');

sequelize.sync({ force: true });
