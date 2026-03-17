'use strict';

require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  await sequelize.sync();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); // eslint-disable-line no-console
  });
}

start();
