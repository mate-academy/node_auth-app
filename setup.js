require('dotenv').config();

const { client } = require('./src/db');

require('./src/models/user');

async function setup() {
  try {
    await client.authenticate();
    await client.sync({ force: true });
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}
setup();
