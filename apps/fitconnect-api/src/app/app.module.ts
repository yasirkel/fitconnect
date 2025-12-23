import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubsModule, TrainingsModule, EnrollmentsModule } from '@fitconnect/features';

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
