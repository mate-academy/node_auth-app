import 'dotenv/config';
import { client } from './utils/db.js';
import { User } from './models/user.js';
import { Token } from './models/token.js';

client.sync({ force: true });
