import 'dotenv/config';

import { app } from './src/app.js';

import { client as sequelize } from './src/utils/db.js';

import './src/models/User.js';
import './src/models/Token.js';

const setup = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

setup();
