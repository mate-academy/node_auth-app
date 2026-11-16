import 'dotenv/config';
// import { user } from './src/models/user.js';
import { client } from './src/db.js';

client.sync({ force: true });
