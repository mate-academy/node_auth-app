'use strict';

require('dotenv').config();

const { sequelize } = require('./src/utils/db.js');

require('./src/models/user.model');
require('./src/models/token.model');
require('./src/models/refreshPasswordToken.model.js');

sequelize.sync({ force: true });
