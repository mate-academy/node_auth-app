import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Token } from './Token.js';

User.hasMany(Token, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
});

export { sequelize, User, Token };
