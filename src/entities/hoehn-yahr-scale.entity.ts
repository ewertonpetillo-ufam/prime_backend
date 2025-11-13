import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('hoehn_yahr_scale')
export class HoehnYahrScale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, unique: true })
  stage: number;

  @Column({ type: 'text' })
  description: string;
}

