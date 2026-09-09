import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';

export const SocialAccount = client.define('socialAccount', {
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  providerAccountId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
