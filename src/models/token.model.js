import { DataTypes } from 'sequelize';
import 'dotenv/config';
import sequelize from '../config/db.connection.js';
import { hashToken } from '../utils/hashToken.js';

const Token = sequelize.define(
  'Refresh',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        key: 'id',
        model: 'users',
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('REFRESH', 'PASSWORD_RESET', 'ACTIVATION'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
    timestamps: false,
    hooks: {
      beforeSave: async (data) => {
        if (data.token && data.changed('token')) {
          data.token = hashToken(data.token);
        }
      },
    },
  },
);

Token.prototype.compareRefresh = function async(candidateToken) {
  return hashToken(candidateToken) === this.token;
};

export { Token };
