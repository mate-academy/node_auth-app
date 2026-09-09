import 'dotenv/config';

import { client } from './src/utils/db.js';

async function setup() {
  try {
    await client.sync({ force: true });
  } catch (error) {
    console.error(error);
  }
}

setup();
