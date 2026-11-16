import 'dotenv/config';
import { sequelize } from './utils/db.js';
import './models/user.model.js';
import './models/token.model.js';

try {
  await sequelize.sync({ alter: true });

  // eslint-disable-next-line no-console
  console.log('Tables are synced');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Table sync failed:', error.message);

  // Finish the script with an error code, so npm / CI see the failure
  process.exitCode = 1;
} finally {
  // Close the DB connection in both cases, success and failure
  await sequelize.close();
}
