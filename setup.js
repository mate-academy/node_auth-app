import db from './src/utils/db.js';
import User from './src/models/User.js';
import Token from './src/models/Token.js';

User.hasMany(Token, {
  foreignKey: 'userId',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
});

db.sync({ force: true });
