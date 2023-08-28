/* eslint-disable quotes */
import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db.js";

export const User = sequelize.define("user", {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
  recoverToken: {
    type: DataTypes.STRING,
  },
});
