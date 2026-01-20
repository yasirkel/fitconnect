import { Injectable } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Injectable()
export class Neo4jEnrollmentSyncService {
  constructor(private readonly neo: Neo4jService) {}

  async upsertEnrollmentGraph(input: {
    userId: string;
    userEmail?: string;
    trainingId: string;
    trainingTitle?: string;
    clubId: string;
    clubName?: string;
  }) {
    const {
      userId,
      userEmail,
      trainingId,
      trainingTitle,
      clubId,
      clubName,
    } = input;

    await this.neo.run(
      `
      MERGE (u:User {id: $userId})
        ON CREATE SET u.email = $userEmail
        ON MATCH SET u.email = coalesce(u.email, $userEmail)

      MERGE (c:Club {id: $clubId})
        ON CREATE SET c.name = $clubName
        ON MATCH SET c.name = coalesce(c.name, $clubName)

      MERGE (t:Training {id: $trainingId})
        ON CREATE SET t.title = $trainingTitle
        ON MATCH SET t.title = coalesce(t.title, $trainingTitle)

      MERGE (t)-[:AT_CLUB]->(c)
      MERGE (u)-[:ENROLLED_IN]->(t)
      `,
      {
        userId,
        userEmail: userEmail ?? null,
        clubId,
        clubName: clubName ?? null,
        trainingId,
        trainingTitle: trainingTitle ?? null,
      },
    );
  }

  async removeEnrollmentGraph(input: { userId: string; trainingId: string }) {
    const { userId, trainingId } = input;

    await this.neo.run(
      `
      MATCH (u:User {id: $userId})-[r:ENROLLED_IN]->(t:Training {id: $trainingId})
      DELETE r
      `,
      { userId, trainingId },
    );
  }

  // Upsert user node met eventuele email en displayName
  async upsertUser(input: { userId: string; email?: string | null; displayName?: string | null }) {
    const { userId, email, displayName } = input;
    await this.neo.run(
      `
      MERGE (u:User {id: $userId})
        ON CREATE SET u.email = $email, u.displayName = $displayName
        ON MATCH SET u.email = coalesce(u.email, $email), u.displayName = coalesce(u.displayName, $displayName)
      `,
      { userId, email: email ?? null, displayName: displayName ?? null },
    );
  }

  async removeUser(input: { userId: string }) {
    const { userId } = input;
    await this.neo.run(
      `
      MATCH (u:User {id: $userId})
      DETACH DELETE u
      `,
      { userId },
    );
  }

  // Upsert training en zorgt ook voor de relatie met club AT_CLUB
  async upsertTraining(input: { trainingId: string; trainingTitle?: string | null; clubId?: string | null; clubName?: string | null }) {
    const { trainingId, trainingTitle, clubId, clubName } = input;
    await this.neo.run(
      `
      MERGE (t:Training {id: $trainingId})
        ON CREATE SET t.title = $trainingTitle
        ON MATCH SET t.title = coalesce(t.title, $trainingTitle)

      MERGE (c:Club {id: $clubId})
        ON CREATE SET c.name = $clubName
        ON MATCH SET c.name = coalesce(c.name, $clubName)

      MERGE (t)-[:AT_CLUB]->(c)
      `,
      { trainingId, trainingTitle: trainingTitle ?? null, clubId: clubId ?? null, clubName: clubName ?? null },
    );
  }

  async removeTraining(input: { trainingId: string }) {
    const { trainingId } = input;
    await this.neo.run(
      `
      MATCH (t:Training {id: $trainingId})
      DETACH DELETE t
      `,
      { trainingId },
    );
  }

  // Upsert club node
  async upsertClub(input: { clubId: string; clubName?: string | null }) {
    const { clubId, clubName } = input;
    await this.neo.run(
      `
      MERGE (c:Club {id: $clubId})
        ON CREATE SET c.name = $clubName
        ON MATCH SET c.name = coalesce(c.name, $clubName)
      `,
      { clubId, clubName: clubName ?? null },
    );
  }

  async removeClub(input: { clubId: string }) {
    const { clubId } = input;
    await this.neo.run(
      `
      MATCH (c:Club {id: $clubId})
      DETACH DELETE c
      `,
      { clubId },
    );
  }
}
