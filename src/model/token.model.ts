import { client } from '../db/db.ts';
import { DataTypes } from 'sequelize';
import { TNAMES, fnames, TKN } from '../static/index.ts';

const nms = fnames[TNAMES.TKN];

const Token = client.define(
  'Token',
  {
    [nms.id]: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    [nms.usr]: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TNAMES.USR,
        key: fnames[TNAMES.USR].id,
      },
      onDelete: 'CASCADE',
    },
    [nms.token]: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    [nms.type]: {
      type: DataTypes.ENUM(TKN.ACT, TKN.PWR, TKN.RFR),
      allowNull: false,
    },
    [nms.exp]: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: TNAMES.TKN,
    updatedAt: false,
  },
);

export default Token;
