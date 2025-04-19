import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./User.model.js";


export const ResetPasswordToken = sequelize.define('ResetPasswordToken', {
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

ResetPasswordToken.belongsTo(User);
User.hasOne(ResetPasswordToken);
