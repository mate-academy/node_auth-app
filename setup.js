/* eslint-disable no-console */
require('dotenv/config');
require('./src/models/user.model.js');
require('./src/models/token.model.js');

const { client } = require('./src/utils/db.js');

client.sync({ force: true }).then(() => {
  console.log('Database synced');
});
