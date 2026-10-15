// setup.ts
import 'dotenv/config';
import { client } from './src/utils/db';
import './src/models';

await client.sync({ force: true });
console.log('Database synchronized');
await client.close();
