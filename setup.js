import 'dotenv/config';
import { client } from './src/utils/db.js';
import './src/models/user.js';
import './src/models/token.js';

client.sync({ force: true });
