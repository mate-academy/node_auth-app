import 'dotenv/config';
import { client } from './src/utils/db.js';

await client.sync();
