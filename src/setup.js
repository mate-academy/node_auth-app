import 'dotenv/config';

import { client } from './utills/db.js';
import './models/userModel.js';
import './models/token.js';

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
