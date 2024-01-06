import { sequelize } from "../utils/db.js";
import { DataTypes } from "sequelize";

export const User = sequelize.define('user', {
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  activationToken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
})
