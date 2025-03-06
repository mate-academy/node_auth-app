import 'dotenv/config';
import { client } from './utils/db.js';
import './models/token.js';
import './models/users.js';

await client.sync({ force: true });
