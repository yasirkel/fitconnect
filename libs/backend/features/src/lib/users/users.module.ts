import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { UsersService } from './users.service';
import { Neo4jModule } from '@fitconnect/backend-neo4j';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    Neo4jModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
