'use strict';

const { app } = require('./src/app');
const { env } = require('./src/config/env');
const { sequelize } = require('./src/config/database');

require('./src/models');

async function start() {
  try {
    await sequelize.authenticate();

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
