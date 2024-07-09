import { DataTypes, UUIDV4 } from "sequelize";
import { client } from "../utils/db.js";

export const User = client.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'users',
  updatedAt: false,
  createdAt: false,
});
