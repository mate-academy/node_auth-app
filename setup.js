/* eslint-disable no-console */
import 'dotenv/config';
import './models';
import { client } from './src/utils/db.js';

async function syncDB() {
  try {
    console.log('Starting database sync');
    await client.authenticate();
    console.log('Database connected');

    const forceSync = process.env.DB_FORCE === 'true';

    await client.sync({ force: forceSync });
    console.log(`Database synced successfully (force: ${forceSync})`);
  } catch (err) {
    console.error('Failed to sync database:', err.message);
  } finally {
    await client.close();
  }
}

syncDB();
