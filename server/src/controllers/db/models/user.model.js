'use strict';
import { DataTypes, UUIDV4 } from "sequelize";
import { sequelizeConnection } from "../db.js";

export const User = sequelizeConnection.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    require: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    require: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    require: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  secretToken: {
    type: DataTypes.STRING,
    require: true,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'users',
});
