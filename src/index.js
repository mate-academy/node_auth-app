'use strict';

require('./load-env');

const config = require('./config');
const { createApp } = require('./app');

const { app, store } = createApp();

if (require.main === module) {
  store.ready
    .then(() => {
      app.listen(config.port, () => {
        console.log(`Northstar is ready at ${config.appUrl}`);

        if (!config.isProduction && !config.resendApiKey) {
          console.log(
            `Email previews are available at ${config.appUrl}/dev/emails`,
          );
        }
      });
    })
    .catch((error) => {
      console.error('Could not start Northstar:', error);
      process.exitCode = 1;
    });
}

module.exports = { app, createApp };
