import 'dotenv/config';
// import { user } from './src/models/user';

import { client } from './src/utils/db.js';

await client.sync({ alter: true });
