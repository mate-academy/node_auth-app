import 'dotenv/config';
import { client } from './backend/src/utils/db.js';
import './backend/src/models/user.js';
import './backend/src/models/token.js';

await client.sync({ alter: true });
