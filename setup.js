/* eslint-disable no-console */
import 'dotenv/config';
import { sequelize } from './src/utils/db.js';

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });
