import { DataTypes } from 'sequelize';
import configs from '../configs/index.config.js';

const User = configs.sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      default: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'users',
  },
);

export default User;
