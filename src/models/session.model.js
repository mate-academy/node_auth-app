import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';
import { User } from './user.model.js';

export const Session = client.define('session', {
  tokenVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    default: 1,
  },
});

Session.belongsTo(User);
