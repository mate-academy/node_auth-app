/* eslint-disable no-console */
import { sequelize } from './connection.js';

export const isAuthenticateSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
