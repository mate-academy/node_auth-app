import { sequelize } from '../utils/db.js';
import User from './User.js';
import Token from './Token.js';

User.hasMany(Token, { foreignKey: 'user_id' });
Token.belongsTo(User, { foreignKey: 'user_id' });

export { sequelize, User, Token };
