import { User } from './user.model.js';
import { RefreshToken } from './refreshToken.model.js';
import { ResetToken } from './resetToken.model.js';
import { ChangeToken } from './changeToken.model.js';

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(ResetToken, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

ResetToken.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(ChangeToken, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

ChangeToken.belongsTo(User, {
  foreignKey: 'userId',
});

export { User, RefreshToken, ResetToken, ChangeToken };
