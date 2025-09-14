import { User } from './user.model.js';
import { Token } from './token.model.js';

User.hasMany(Token, {
  foreignKey: { name: 'userId', allowNull: false },
  onDelete: 'CASCADE',
});

Token.belongsTo(User, {
  foreignKey: { name: 'userId', allowNull: false },
  onDelete: 'CASCADE',
});
