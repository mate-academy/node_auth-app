import { sequelize } from './src/utils/db.js';
import './src/models/user.js';
import './src/models/token.js';

await sequelize.sync({ alter: true });
