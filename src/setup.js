import { User } from './models/user.model.js';
import { Token } from './models/token.model.js';
import { sequelize } from './utils/db.js';

await sequelize.sync({ force: true });
