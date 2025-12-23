import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateEnrollmentDto } from '@fitconnect/dto';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}
  
  @Get()
  findAll() {
    return this.service.findAll();
  }
  
  @Post()
  enroll(@Body() dto: CreateEnrollmentDto) {
    return this.service.enroll(dto);
  }

  @Get('/trainings/:trainingId')
  getByTraining(@Param('trainingId') id: string) {
    return this.service.findByTraining(id);
  }

  @Get('/users/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
