import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubsModule } from './clubs.module';
import { ClubsController } from './clubs/clubs.controller';
import { ClubsService } from './clubs/clubs.service';

@Module({
  imports: [ClubsModule],
  controllers: [AppController, ClubsController],
  providers: [AppService, ClubsService],
})
export class AppModule {}
