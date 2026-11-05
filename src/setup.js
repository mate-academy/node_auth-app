const { sequelize } = require('./utils/db');

require('./models/User');

sequelize
  .sync({ force: true })
  // eslint-disable-next-line no-console
  .then(() => console.log('Tables created'))
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err))
  .finally(() => sequelize.close());
