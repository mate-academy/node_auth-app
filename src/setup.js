/* eslint-disable no-console */
import 'dotenv/config';
import chalk from 'chalk';
import { sequelize } from './utils/db.js';
import './models/user.model.js';

sequelize.sync({ force: true }).finally(() => {
  console.log(chalk.green('Database synced'));
});
