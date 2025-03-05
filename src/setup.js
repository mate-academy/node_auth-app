import 'dotenv/config';
import { client } from './utils/db.js';
import './models/User.model.js';
import './models/Token.model.js';

await client.sync({ force: true });
