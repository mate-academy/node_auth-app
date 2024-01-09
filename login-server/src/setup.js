'use strict';
require('dotenv').config();

require('./models/user.js');
require('./models/token');

const { client } = require('./utils/db.js');

client.sync({ force: true })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Database synchronized.');
    // You might do additional tasks after synchronization
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error synchronizing database:', error);
  });
