import { sequelize } from './utils/db.js';

await sequelize.sync({ force: true });
