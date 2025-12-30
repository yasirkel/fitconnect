import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { CreateEnrollmentDto } from '@fitconnect/dto';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}
  
  @Get()
  findAll() {
    return this.service.findAll();
  }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  enroll(@Body() dto: CreateEnrollmentDto, @Req() req: any) {
    return this.service.enroll(dto.trainingId, req.user.userId);
  }


  @Get('/trainings/:trainingId')
  getByTraining(@Param('trainingId') id: string) {
    return this.service.findByTraining(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/:userId')
  getByUser(@Param('userId') userId: string, @Req() req: any) {
    if (userId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own enrollments');
    }
    return this.service.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.removeOwned(id, req.user.userId);
  }

}
