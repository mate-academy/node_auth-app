import { User } from './src/models/user.js';
import { Token } from './src/models/token.js';

import { client } from './src/utils/db.js';
console.log(Object.keys(client.models));
client.sync({ force: true });
