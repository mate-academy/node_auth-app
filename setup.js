import 'dotenv/config';
// import { user } from './src/models/user.module.js';
import { client } from './src/utils/db.js';

await client.sync({ force: true });
