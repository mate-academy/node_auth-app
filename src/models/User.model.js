import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const User = client.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'User',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password must not be empty',
      },
      notNull: {
        msg: 'Password must not be null',
      },
    },
  },
  activationToken: {
    type: DataTypes.STRING,
  },
});
