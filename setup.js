import 'dotenv/config';
// eslint-disable-next-line no-unused-vars
import { User } from './src/models/user.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
