import 'dotenv/config';
import { sequelize } from './utils/db.js';
import { User } from './models/user.model.js';

try {
  await sequelize.sync({ force: true });

  // eslint-disable-next-line no-console
  console.log('Table created');
  await sequelize.close();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Table creation failed:', error.message);
}
