import 'dotenv/config';
import { User } from './src/models/user.js';

import { client } from './src/utils/db.js';

(async () => {
  try {
    await client.authenticate();
    console.log('✅ Database connected');

    await client.sync({ alter: true });
    console.log('✅ Tables synchronized');
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
