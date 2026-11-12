import { models } from './models.js';
const { User, Expense, RefreshToken, ResetPasswordToken } = models;

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'cascade' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'cascade' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ResetPasswordToken, { foreignKey: 'userId', onDelete: 'cascade' });
ResetPasswordToken.belongsTo(User, { foreignKey: 'userId' });

