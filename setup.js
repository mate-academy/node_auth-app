import 'dotenv/config';

import './src/models/token.js';
import './src/models/user.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
