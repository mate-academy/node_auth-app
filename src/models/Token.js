import { DataTypes } from '@sequelize/core';
import sequelize from '../utils/db.js';

const Token = sequelize.define(
  'token',
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    paranoid: false,
  },
);

export default Token;
