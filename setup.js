import 'dotenv/config';
import { User } from './src/models/user.model.js';
import { client } from './src/utils/db.js';

client.sync({ force: true })