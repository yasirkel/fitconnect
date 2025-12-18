import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubsModule } from './clubs.module';

import { TrainingsModule } from './trainings/trainings.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/fitconnect'),
    ClubsModule,
    TrainingsModule,
    EnrollmentsModule,
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
