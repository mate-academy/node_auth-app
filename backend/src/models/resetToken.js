import { DataTypes } from "sequelize";
import { client } from "../utils/db.js";
import { User } from "./user.js";


export const ResetToken = client.define('resetToken', {
  resetToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users' }
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
})

ResetToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ResetToken, { foreignKey: 'userId' });
