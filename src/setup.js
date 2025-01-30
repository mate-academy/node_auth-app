import 'dotenv/config';
import { client } from './utils/db.js';

client.sync({ force: true });
