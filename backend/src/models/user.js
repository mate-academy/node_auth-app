import { client } from '../utils/db.js';
import { Sequelize } from 'sequelize';

export const User = client.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  activationToken: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  resetToken: {
    type: Sequelize.STRING,
  },
});
