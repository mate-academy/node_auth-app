import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confirmEmailToken: {
    type: DataTypes.STRING,
  },
});

// import { DataTypes } from 'sequelize';
// import { sequelize } from '../utils/db.js';

// export const User = sequelize.define('user', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   activationToken: {
//     type: DataTypes.STRING,
//   },
// });
