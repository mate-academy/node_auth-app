/* eslint-disable no-console */
'use strict';

const { createServer } = require('./createServer');
const { sequelize } = require('./utils/db.js');

require('./model/models');

const PORT = 3005;

const app = createServer();

sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, 'localhost', () => {
    console.log('Server is running');
  });
});
