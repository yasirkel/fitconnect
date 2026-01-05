import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from './club.schema';
import { Training, TrainingSchema } from '../trainings/training.schema';
import { Neo4jModule } from '@fitconnect/backend-neo4j';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: Training.name, schema: TrainingSchema },
    ]),
    Neo4jModule,
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})

export class ClubsModule {}
