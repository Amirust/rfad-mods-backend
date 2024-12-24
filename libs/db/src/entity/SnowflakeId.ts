import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export class SnowflakeId {
  @PrimaryColumn()
  declare id: string

  @CreateDateColumn()
  declare createdAt: Date

  @UpdateDateColumn()
  declare updatedAt: Date
}