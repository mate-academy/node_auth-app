import 'dotenv/config';
import { sequelize } from './utils/db.js';

import './models/Token.js';
import './models/User.js';

sequelize.sync({ force: true });
