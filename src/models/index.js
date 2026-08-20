import sequelize from '../config/db.connection.js';
import { Sequelize } from 'sequelize';
import { User } from './user.model.js';
import { Token } from './token.model.js';

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Token, { foreignKey: 'userId' });

export { Sequelize, sequelize, User, Token };
