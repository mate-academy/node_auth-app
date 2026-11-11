/* eslint-disable no-console */
'use strict';

import { createServer } from './config/createServer.js';
import { sequelize } from './config/db.js';

import './models/associations.js';

async function start() {
  await sequelize
    .authenticate()
    .then(() =>
      console.log('Connection to DB has been established successfully.'),
    )
    .catch((error) =>
      console.error('Unable to connect to the database:', error),
    );

  await sequelize.sync();
}

await start();

const server = createServer();

server.listen(3000, () => {
  console.log('Server is running on localhost:3000');
});

process.on('SIGTERM', async () => {
  await sequelize.close();
  server.close();
});
