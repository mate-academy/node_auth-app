'use strict';

require('./load-env');

const config = require('./config');
const { createApp } = require('./app');
const { logger } = require('./logger');

const { app, store } = createApp();

if (require.main === module) {
  store.ready
    .then(() => {
      app.listen(config.port, () => {
        logger.info(`Northstar is ready at ${config.appUrl}`);

        if (!config.isProduction && !config.resendApiKey) {
          logger.info(
            `Email previews are available at ${config.appUrl}/dev/emails`,
          );
        }
      });
    })
    .catch((error) => {
      logger.error(error);
      process.exitCode = 1;
    });
}

module.exports = { app, createApp };
