import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { FreelivingActionType } from '../../entities/freeliving-action-type.entity';
import { FreelivingCollectionEvent } from '../../entities/freeliving-collection-event.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { AdminFreelivingController } from './admin-freeliving.controller';
import { FreelivingEventsController } from './freeliving-events.controller';
import { FreelivingService } from './freeliving.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FreelivingCollectionEvent,
      FreelivingActionType,
      Patient,
      BinaryCollection,
      ActiveTaskDefinition,
    ]),
  ],
  controllers: [FreelivingEventsController, AdminFreelivingController],
  providers: [FreelivingService],
  exports: [FreelivingService],
})
export class FreelivingModule {}
