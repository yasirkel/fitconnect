import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubDocument } from './club.schema';
import { CreateClubDto, UpdateClubDto } from '@fitconnect/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  async getAll(): Promise<ClubDocument[]> {
    return this.clubsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ClubDocument> {
    return this.clubsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateClubDto, @Req() req: any): Promise<ClubDocument> {
    return this.clubsService.create(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateClubDto, @Req() req: any
  ): Promise<ClubDocument> {
    return this.clubsService.update(id, body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<{ success: true }> {
    return this.clubsService.remove(id, req.user.userId);
  }
}
