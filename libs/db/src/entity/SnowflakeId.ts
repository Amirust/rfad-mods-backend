import { CreateDateColumn, PrimaryColumn } from 'typeorm'

export class SnowflakeId {
  @PrimaryColumn()
  declare id: string

  @CreateDateColumn()
  declare createdAt: Date
}