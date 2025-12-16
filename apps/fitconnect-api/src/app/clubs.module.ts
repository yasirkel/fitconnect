import { Module } from '@nestjs/common';
import { ClubsController } from './clubs/clubs.controller';
import { ClubsService } from './clubs/clubs.service';

import { MongooseModule } from '@nestjs/mongoose';
import { ClubDocument, ClubSchema } from './clubs/club.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClubDocument.name, schema: ClubSchema }]),
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})

export class ClubsModule {}
