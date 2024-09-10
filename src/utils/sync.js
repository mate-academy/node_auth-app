import '../models/user.js';
import '../models/token.js';
import 'dotenv/config';
import { sequelize } from './db.js';

const sync = () => sequelize.sync({ force: true });

sync();
