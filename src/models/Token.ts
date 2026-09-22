import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { User } from './User.js';

@Table({
  tableName: 'Token',
  timestamps: false,
})
export class Token extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    unique: true,
  })
  refreshToken!: string;
}
