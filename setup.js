import 'dotenv/config';
// eslint-disable-next-line no-unused-vars
import { user } from './src/models/user.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
