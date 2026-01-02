import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jTestController } from './neo4j-test.controller';
import { ClubsModule, TrainingsModule, EnrollmentsModule, UsersModule, AuthModule  } from '@fitconnect/features';

import { Neo4jModule } from '@fitconnect/backend-neo4j';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/fitconnect'),
    Neo4jModule,
    ClubsModule,
    TrainingsModule,
    EnrollmentsModule,
    UsersModule,
    AuthModule,
  ],
  
  controllers: [AppController, Neo4jTestController],
  providers: [AppService],
})
export class AppModule {}
