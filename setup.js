/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import 'dotenv/config';
import { User } from './src/models/User.model.js';
import { Token } from './src/models/Token.model.js';
import { EmailChangeRequest } from './src/models/EmailChangeRequest.model.js';
import { client } from './src/utils/db.js';

const setup = async () => {
  try {
    await client.authenticate();
    console.log('Connection has been established successfully.');

    await client.sync({ force: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

setup();
