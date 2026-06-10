import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { BinaryCollectionsModule } from '../binary-collections/binary-collections.module';

@Module({
  imports: [BinaryCollectionsModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
