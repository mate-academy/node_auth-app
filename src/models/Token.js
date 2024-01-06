import {sequelize} from "../utils/db.js";
import {DataTypes} from "sequelize";
import {User} from "./User.js";

export const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
