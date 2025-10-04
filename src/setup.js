/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { sequelize } from './utils/db.js';
import { User } from './models/user.js';
import { Token } from './models/token.js';

(async () => {
  try {
    const syncOptions =
      process.env.NODE_ENV === 'development'
        ? { force: true }
        : { alter: true };

    await sequelize.sync(syncOptions);
    console.log('Database synced successfully');
  } catch (err) {
    console.error('DB sync failed:', err);
    process.exit(1);
  }
})();
