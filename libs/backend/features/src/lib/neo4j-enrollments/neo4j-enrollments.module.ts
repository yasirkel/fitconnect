import { Module } from '@nestjs/common';
import { Neo4jModule } from '@fitconnect/backend-neo4j';
import { Neo4jEnrollmentsController } from './neo4j-enrollments.controller';

@Module({
  imports: [Neo4jModule],
  controllers: [Neo4jEnrollmentsController],
})
export class Neo4jEnrollmentsModule {}
