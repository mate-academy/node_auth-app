import { DataTypes } from "sequelize";
import { client } from "../utils/db.js";

// defining columns in dataBase
export const User = client.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
});
