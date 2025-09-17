import 'dotenv/config';

import { User } from './src/models/User.js';
import { Token } from './src/models/Token.js';
import { client } from './src/utils/db.js';

async function initializeDatabase() {
  // Guard sync with force: true to only run in test or development environments
  if (
    process.env.NODE_ENV !== 'test' &&
    process.env.NODE_ENV !== 'development'
  ) {
    throw new Error(
      'Database sync with force: true is not allowed in production environment',
    );
  }

  try {
    await client.sync({ force: true });
  } catch (error) {
    throw error;
  }
}

// Execute the initialization
initializeDatabase().catch((error) => {
  throw new Error('Failed to initialize database:', error.message);
});
