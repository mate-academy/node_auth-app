import 'dotenv/config';
import { client } from './utils/db.js';
import { User } from './models/user.js';

client.sync({ force: true });
