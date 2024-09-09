import '../models/user.js';
import { sequelize } from './db.js';

const sync = () => sequelize.sync({ force: true });

sync();
