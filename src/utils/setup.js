const { sequelize } = require('../db');

require('../users/user.model');

const synchronize = async () => {
  await sequelize.sync({ force: true });
};

synchronize();
