/* eslint-disable no-unused-vars */
import 'dotenv/config';
import { User } from './models/user.js';
import { Token } from './models/token.js';
import { client } from './utils/db.js';

client.sync({ force: true });
