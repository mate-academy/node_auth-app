const { sequelize } = require('./utils/db');

require('./models/User');

sequelize
  .sync({ force: true })
  .then(() => console.log('Tables created'))
  .catch((err) => console.error(err))
  .finally(() => sequelize.close());
