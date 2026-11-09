const { sequelize } = require('./utils/db');

require('./models/User');
require('./models/Token');

sequelize
  .sync()
  // eslint-disable-next-line no-console
  .then(() => console.log('Tables created'))
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err))
  .finally(() => sequelize.close());
