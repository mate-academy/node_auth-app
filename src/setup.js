/* eslint-disable no-console */
import 'dotenv/config';
import { client } from './utils/db.js';
import './models/user.model.js';
import './models/token.js';

await client.sync();
