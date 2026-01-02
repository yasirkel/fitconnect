import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { Neo4jService } from '@fitconnect/backend-neo4j';

// App sets a global prefix `api` in main.ts. Use 'neo4j' here so
// the final route becomes `/api/neo4j/ping`.
@Controller('neo4j')
export class Neo4jTestController {
  constructor(private readonly neo: Neo4jService) {}

  @Get('ping')
  async ping() {
    try {
      const res = await this.neo.run('RETURN 1 AS ok');
      const val: any = res.records[0].get('ok');
      const ok = typeof val?.toNumber === 'function' ? val.toNumber() : val;
      return { ok };
    } catch (err: any) {
      // return a clear error without crashing the app
      throw new HttpException(
        { ok: 0, error: err?.message ?? 'Neo4j error' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
