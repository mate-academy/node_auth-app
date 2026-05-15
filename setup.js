import 'dotenv/config';
import { client } from './src/utils/db.js';

async function initDB() {
  try {
    await client.sync({ alter: true });
    console.log('Database successfully synchronized!');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing the database:', error);
    process.exit(1);
  }
}

initDB();
