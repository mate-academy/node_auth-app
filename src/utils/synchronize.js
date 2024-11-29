/* eslint-disable no-console */
const { client } = require('../../setup.js');

require('../models/User.js');
require('../models/Token.js');

async function syncDatabase(force = false) {
  try {
    await client.sync({ force });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  }
}

module.exports = { syncDatabase };
