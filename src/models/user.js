import { DataTypes } from 'sequelize';
import { client } from '../db.js';
// import { useState } from 'react';

export const User = client.define('user', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
  },
});

// const emailVerified = useState(false);

export const FindByEmail = (email) => {
  return User.findOne({ where: { email } });
};
