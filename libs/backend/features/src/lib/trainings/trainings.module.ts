import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { Training, TrainingSchema } from './training.schema';

import { Club, ClubSchema } from '../clubs/club.schema';
import { Enrollment, EnrollmentSchema } from '../enrollments/enrollment.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: Club.name, schema: ClubSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
