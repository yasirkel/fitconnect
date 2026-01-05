import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './enrollment.schema';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { Training, TrainingSchema } from '../trainings/training.schema';
import { Club, ClubSchema } from '../clubs/club.schema';
import { Neo4jModule } from '@fitconnect/backend-neo4j';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Training.name, schema: TrainingSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
    Neo4jModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
