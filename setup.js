import 'dotenv/config';
import { User } from './src/models/user.model.js';
import { Token } from './src/models/token.model.js';
import { ResetToken } from './src/models/resetToken.model.js';
import { EmailChanges } from './src/models/emailChanges.model.js';

import { client } from './src/utils/db.js';

client.sync({ force: true });
