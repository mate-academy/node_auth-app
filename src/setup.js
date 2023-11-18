'use strict';

const { sequelize } = require('./utils/db.js');

sequelize.sync({ force: true });
