import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { Neo4jRecommendationService } from './neo4j.recommendation.service';
import { Neo4jEnrollmentSyncService } from './neo4j-enrollment-sync.service';

@Module({
  providers: [Neo4jService, Neo4jRecommendationService, Neo4jEnrollmentSyncService],
  exports: [Neo4jService, Neo4jRecommendationService, Neo4jEnrollmentSyncService],
})
export class Neo4jModule {}
