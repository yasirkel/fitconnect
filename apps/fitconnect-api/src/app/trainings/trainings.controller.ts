import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { TrainingsService } from './trainings.service';

@Controller()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // GET /api/trainings
  @Get('trainings')
  findAll() {
    return this.trainingsService.findAll();
  }

  // GET /api/trainings/:id
  @Get('trainings/:id')
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }

  // GET /api/clubs/:clubId/trainings relatie endpoint
  @Get('clubs/:clubId/trainings')
  findByClub(@Param('clubId') clubId: string) {
    return this.trainingsService.findByClubId(clubId);
  }

  // POST /api/trainings
  @Post('trainings')
  create(@Body() dto: CreateTrainingDto) {
    return this.trainingsService.create(dto);
  }

  // PATCH /api/trainings/:id
  @Patch('trainings/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTrainingDto) {
    return this.trainingsService.update(id, dto);
  }

  // DELETE /api/trainings/:id
  @Delete('trainings/:id')
  async remove(@Param('id') id: string) {
    await this.trainingsService.remove(id);
    return { success: true };
  }
}
