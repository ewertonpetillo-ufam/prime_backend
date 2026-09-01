import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('freeliving_action_types')
export class FreelivingActionType {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  label_pt: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
