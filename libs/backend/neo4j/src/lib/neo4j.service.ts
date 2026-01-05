import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import neo4j, { Driver, Result } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver | null = null;
  private initialized = false;

  private initDriver(): void {
    if (this.initialized) return;
    this.initialized = true;

    const uri = process.env['NEO4J_URI'];
    const user = process.env['NEO4J_USER'];
    const password = process.env['NEO4J_PASSWORD'];

    if (!uri || !user || !password) {
      this.logger.warn('NEO4J env vars missing; Neo4j will be disabled.');
      this.driver = null;
      return;
    }

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      this.logger.log(`Neo4j driver initialized (${uri})`);
    } catch (err) {
      this.logger.error('Failed to initialize Neo4j driver', err as any);
      this.driver = null;
    }
  }

  // execute a cypher query; throws if driver not available
  async run<T = any>(cypher: string, params: Record<string, any> = {}): Promise<Result> {
    if (!this.initialized) this.initDriver();
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }

    const session = this.driver.session();
    try {
      const result = await session.run(cypher, params);
      return result;
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      try {
        await this.driver.close();
        this.logger.log('Neo4j driver closed');
      } catch (err) {
        this.logger.error('Error closing Neo4j driver', err as any);
      }
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
