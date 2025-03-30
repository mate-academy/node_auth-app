import { DataTypes } from 'sequelize';
import configs from '../configs/index.config.js';

const Auth = configs.sequelize.define(
  'Auth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    activate: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'auths',
  },
);

export default Auth;
