import 'dotenv/config';
import { client } from './utils/db.js';
// eslint-disable-next-line no-unused-vars
import { User } from './models/user.js';
// eslint-disable-next-line no-unused-vars
import { Token } from './models/token.js';

client.sync({ alter: true });
