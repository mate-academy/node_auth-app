import { ResetPasswordToken } from "./PasswordResetToken.model.js";
import { RefreshToken } from "./RefreshToken.model.js";
import { User } from "./User.model.js";

User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'cascade' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ResetPasswordToken, { foreignKey: 'userId', onDelete: 'cascade' });
ResetPasswordToken.belongsTo(User, { foreignKey: 'userId' });
