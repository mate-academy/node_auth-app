import 'dotenv/config';
import { user } from './src/models/user.js';

import { client } from './src/utils/db.js';

client.sync({ force: true })
