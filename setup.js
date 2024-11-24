/* eslint-disable no-unused-vars */
import 'dotenv/config';
import { client } from './src/utils/db.js';
import { User } from './src/models/user.js';
import { Token } from './src/models/token.js';

client.sync({
  force: true,
});
