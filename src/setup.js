import 'dotenv/config';
import { sequelize } from './utils/db.js';
import './models/user.js';
import './models/token.js';

sequelize.sync({ force: true });
