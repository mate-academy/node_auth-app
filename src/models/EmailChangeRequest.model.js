import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './User.model.js';

export const EmailChangeRequest = client.define('EmailChangeRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Email address must be valid',
      },
      notEmpty: {
        msg: 'Email address must not be empty',
      },
      notNull: {
        msg: 'Email address must not be null',
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
});

EmailChangeRequest.belongsTo(User, {
  foreignKey: {
    allowNull: false,
  },
});
User.hasOne(EmailChangeRequest, { onDelete: 'CASCADE' });
