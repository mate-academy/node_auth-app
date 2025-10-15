import 'dotenv/config';
// import { User } from './src/models/User.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
