import dotenv from 'dotenv';
import './models/user.js';
import { createServer } from './createServer.js';
import { sequelize } from './utils/db.js';

dotenv.config({ path: '../.env' });

(async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: true });

    createServer().listen(5700, () => {});
  } catch (error) {}
})();
