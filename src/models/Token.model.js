import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './User.model.js';

export const Token = client.define(
  'token',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('refresh', 'reset'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['refresh', 'reset']],
          msg: 'Type must be either refresh or reset',
        },
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: {
        msg: 'Token must not be empty',
      },
      notNull: {
        msg: 'Token must not be null',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'ExpiresAt must be a valid date',
        },
        notEmpty: {
          msg: 'ExpiresAt must not be empty',
        },
        notNull: {
          msg: 'ExpiresAt must not be null',
        },
      },
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'type'],
      },
    ],
  },
);

Token.belongsTo(User, {
  foreignKey: {
    allowNull: false,
  },
});
User.hasMany(Token, { onDelete: 'CASCADE' });
