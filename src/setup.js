require('dotenv/config');
require('./models/User.js');
require('./models/Token.js');

const { sequelize } = require('./utils/db.js');

sequelize.sync({ force: true });
