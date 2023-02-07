'use strict';

import 'dotenv/config';
import './models/User.js';
import './models/Token.js';
import './models/GoogleData.js';
import './models/GithubData.js';
import { sequelize } from './utils/db.js';

sequelize.sync({ force: true });
