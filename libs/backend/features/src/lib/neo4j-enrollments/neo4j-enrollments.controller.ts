import { Controller, Get, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { Neo4jRecommendationService } from '@fitconnect/backend-neo4j';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('neo4j/enrollments')
export class Neo4jEnrollmentsController {
  constructor(private readonly rec: Neo4jRecommendationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/clubs')
  async recommendClubs(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new HttpException('Missing authenticated user id', HttpStatus.BAD_REQUEST);
    }

    try {
      const recs = await this.rec.recommendClubsForUser(userId);
      return recs;
    } catch (err: any) {
      throw new HttpException(
        { statusCode: 503, message: err?.message ?? 'Neo4j recommendation error' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
