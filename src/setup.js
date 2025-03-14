import 'dotenv/config';

import { client } from './src/utils/db.js';

client.sync({ force: true });
