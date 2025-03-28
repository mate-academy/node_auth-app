import 'dotenv/config';
import { User } from './src/model/user.js';
import { client } from './src/utils/db.js';

client.sync({ force: true })
