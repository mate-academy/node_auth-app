import { client } from './utils/db.utils.js';

client.sync({ force: true });
