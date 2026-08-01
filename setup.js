import 'dotenv/config';
import { client } from './src/utils/db.js';
import './src/models/models.js';

await client.sync({ force: true });
await client.close();
