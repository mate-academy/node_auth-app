'use strict';

require('dotenv').config();
require('./components/users/schema/users.schema');
require('./components/auth/schema/token');

const { sequelize } = require('./utils/db');

sequelize.sync({ force: true });
