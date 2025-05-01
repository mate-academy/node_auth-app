import { client } from "./src/db.js";
import 'dotenv/config';
import { User } from './src/models/User.model.js';

client.sync({ force: true });