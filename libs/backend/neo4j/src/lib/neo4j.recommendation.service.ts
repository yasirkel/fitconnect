import { Injectable } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Injectable()
export class Neo4jRecommendationService {
  constructor(private readonly neo: Neo4jService) {}

  async recommendClubsForUser(userId: string) {
    const result = await this.neo.run(
      `
      // Clubs waar "ik" al geweest ben (via enrollments)
      MATCH (me:User {id: $userId})-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(myClub:Club)

      // Vind andere users die ook bij die clubs komen
      MATCH (other:User)-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(myClub)
      WHERE other <> me

      // Clubs waar die other users komen, maar ik nog niet
      MATCH (other)-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(rec:Club)
      WHERE NOT (me)-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(rec)

      RETURN rec.id AS clubId, rec.name AS clubName, count(*) AS score
      ORDER BY score DESC
      LIMIT 5
      `,
      { userId }
    );

    return result.records.map((r) => ({
      clubId: r.get('clubId'),
      clubName: r.get('clubName'),
      score: r.get('score').toInt(),
    }));
  }
}
