'use strict';

require('dotenv').config();

const { sequelize } = require('./utils/db');

require('./models/User.js');
require('./models/Token.js');

sequelize.sync({ force: true });
