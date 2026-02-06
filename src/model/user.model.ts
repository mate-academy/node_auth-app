import { client } from '../db/db.ts';
import { DataTypes } from 'sequelize';
import { TNAMES, fnames } from '../static/index.ts';

const nms = fnames[TNAMES.USR];

const User = client.define(
  'User',
  {
    [nms.id]: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    [nms.name]: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    [nms.email]: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    [nms.pwd]: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    [nms.act]: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: TNAMES.USR,
    timestamps: true,
  },
);

export default User;
