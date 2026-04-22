'use strict';

require('dotenv').config();

const { app } = require('./src/app');
const { sequelize } = require('./src/db');

const PORT = process.env.PORT || 4000;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(PORT, () => {
    process.stdout.write(`Server listening on http://localhost:${PORT}\n`);
  });
}

start().catch((error) => {
  process.stderr.write(`Failed to start server: ${error}\n`);
  process.exit(1);
});
