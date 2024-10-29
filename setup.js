import 'dotenv/config';
import { User } from './src/models/user.js';
import { Token } from "./src/models/token.js";
import { client } from './src/utils/db.js';

client.sync({ alter: true });
