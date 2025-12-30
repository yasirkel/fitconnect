import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TrainingsService } from './trainings.service';
import { TrainingDocument } from './training.schema';
import { CreateTrainingDto, UpdateTrainingDto } from '@fitconnect/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  async findAll(): Promise<TrainingDocument[]> {
    return this.trainingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TrainingDocument> {
    return this.trainingsService.findOne(id);
  }

  @Get('/clubs/:clubId')
  async findByClub(@Param('clubId') clubId: string): Promise<TrainingDocument[]> {
    return this.trainingsService.findByClubId(clubId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateTrainingDto,
    @Req() req: any,
  ): Promise<TrainingDocument> {
    return this.trainingsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrainingDto,
    @Req() req: any,
  ): Promise<TrainingDocument> {
    return this.trainingsService.update(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ success: true }> {
    return this.trainingsService.remove(id, req.user.userId);
  }
}
