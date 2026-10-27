import 'dotenv/config';
import { client } from './src/utils/db.js';
import { Token } from './src/models/token.js';
import { User } from './src/models/user.js';

client.sync({ force: true });
