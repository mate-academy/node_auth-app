import 'dotenv/config';

import { sequelize } from './src/utils/db.js';
import { User } from './src/models/user.js';
import { Token } from './src/models/token.js';

// await User.sync({ force: true });
// await Token.sync({ force: true });
await sequelize.sync({ force: true });
