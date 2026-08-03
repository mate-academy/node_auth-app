require('dotenv/config');

const { client } = require('./utills/db.js');

require('./models/userModel.js');
require('./models/token.js');

/* client.sync({ force: true }); */

async function setup() {
  try {
    await client.sync({ force: true });

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

setup();
