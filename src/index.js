'use strict';

require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/db');

require('./models/User');

const PORT = process.env.PORT || 3000;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
}

start();
