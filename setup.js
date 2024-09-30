/* eslint-disable no-unused-vars */

import 'dotenv/config';
import { User } from './src/models/User.model.js';
import { client } from './src/utils/db.js';

async function setupDatabase() {
  try {
    await client.sync({ force: true });
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

setupDatabase();
