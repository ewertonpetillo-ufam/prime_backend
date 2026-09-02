import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { FreelivingActionType } from '../../entities/freeliving-action-type.entity';
import { FreelivingCollectionEvent } from '../../entities/freeliving-collection-event.entity';
import { FreelivingDiary } from '../../entities/freeliving-diary.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { AdminFreelivingController } from './admin-freeliving.controller';
import { FreelivingDiaryController } from './freeliving-diary.controller';
import { FreelivingEventsController } from './freeliving-events.controller';
import { FreelivingService } from './freeliving.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FreelivingCollectionEvent,
      FreelivingActionType,
      FreelivingDiary,
      Patient,
      BinaryCollection,
      ActiveTaskDefinition,
    ]),
  ],
  controllers: [
    FreelivingEventsController,
    FreelivingDiaryController,
    AdminFreelivingController,
  ],
  providers: [FreelivingService],
  exports: [FreelivingService],
})
export class FreelivingModule {}
