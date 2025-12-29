import { DataTypes } from "sequelize";
import { client } from "../utils/db.utils.js";
import { User } from "./user.model.js";

export const Token = client.define('Tokens', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User, { foreignKey: 'UserId', onDelete: 'CASCADE' });
User.hasOne(Token, { foreignKey: 'UserId' });
