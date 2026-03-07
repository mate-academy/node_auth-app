import 'dotenv/config';
import { client } from './src/utils/db.js';
import { User } from './src/models/user.js';

client.sync({ force: true });
