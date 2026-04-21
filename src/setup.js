const sequelize = require('./utils/db.js');

require('./models');

sequelize.sync({ force: true });
