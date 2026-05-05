import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'tokens',
  timestamps: false,
})
export class Token extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    unique: true,
  })
  refreshToken!: string;
}
