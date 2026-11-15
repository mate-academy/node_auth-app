import 'dotenv/config';
import { sequelize } from './utils/db.js';
import './models/user.model.js';
import './models/token.model.js';

try {
  await sequelize.sync({ alter: true });

  // eslint-disable-next-line no-console
  console.log('Table created');
  await sequelize.close();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Table creation failed:', error.message);
}
