import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinaryCollectionsService } from './binary-collections.service';
import { BinaryCollectionsController } from './binary-collections.controller';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BinaryCollection, Patient, ActiveTaskDefinition])],
  controllers: [BinaryCollectionsController],
  providers: [BinaryCollectionsService],
  exports: [BinaryCollectionsService],
})
export class BinaryCollectionsModule {}
