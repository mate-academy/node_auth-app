import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./User.model.js";


export const Token = sequelize.define('Token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

Token.belongsTo(User);
User.hasOne(Token);
