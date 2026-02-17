import 'dotenv/config';
import { client } from './src/utils/db.js';
import { User } from './src/models/User.js';
import { Token } from './src/models/Token.js';

async function init() {
  try {
    await client.sync({ alter: true });
    console.log('Database tables recreated!');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

init();
