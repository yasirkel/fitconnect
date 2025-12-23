import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

import { MongooseModule } from '@nestjs/mongoose';
import { ClubDocument, ClubSchema } from './club.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClubDocument.name, schema: ClubSchema }]),
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})

export class ClubsModule {}
