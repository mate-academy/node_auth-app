'use strict';

const { createApp } = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();

  return createApp().listen(env.port);
}

if (require.main === module) {
  start().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  createApp,
  start,
};
