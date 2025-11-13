import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('collection_form_types')
export class CollectionFormType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;
}

