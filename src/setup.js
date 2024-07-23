const { sequelize } = require('./utils/db.js');

await sequelize.sync({ force: true });
