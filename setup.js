import 'dotenv/config';
import { client } from './src/utils/db.js';

import { User } from './src/models/user.js';
import { Token } from './src/models/token.js';
import { ResetToken } from './src/models/resetToken.js';

client.sync({ force: true });
