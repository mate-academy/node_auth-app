'use strict';

require('dotenv').config();

const { sequelize } = require('./db');

require('./models/User');
require('./models/RefreshSession');

const { app } = require('./server');

const PORT = Number(process.env.PORT || 3001);

(async () => {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('DB connected OK');

    await sequelize.sync();
    // eslint-disable-next-line no-console
    console.log('DB synced OK');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
