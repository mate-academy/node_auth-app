'use strict';

const config = require('./config');
const { sequelize } = require('./models');
const sessionConfig = require('./middlewares/session');
const createApp = require('./app');
const logger = require('./utils/logger');

async function start() {
  if (!config.hasSessionSecret) {
    logger.logError('[warn] SESSION_SECRET not set: sessions are lost.');
  }

  await sequelize.authenticate();
  await sequelize.sync(); // creates the tables when they do not exist
  await sessionConfig.sessionStore.sync();

  createApp().listen(config.port, () => {
    logger.log(`Auth app running at ${config.baseUrl}`);
  });
}

start().catch((error) => {
  logger.logError('[fatal]', error.stack || error);
  process.exitCode = 1;
});
