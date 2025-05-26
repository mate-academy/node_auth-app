import 'dotenv/config';
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
// eslint-disable-next-line no-unused-vars
import { User } from './src/models/user.model.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
