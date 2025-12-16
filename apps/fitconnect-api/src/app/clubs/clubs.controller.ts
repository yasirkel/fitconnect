import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { Club } from './club.model';
import { ClubDocument } from './club.schema';
import { CreateClubDto } from './create-club.dto';
import { UpdateClubDto } from './update-club.dto';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  async getAll(): Promise<ClubDocument[]> {
    return this.clubsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ClubDocument> {
    const club = await this.clubsService.findOne(id);
    if (!club) {
      throw new NotFoundException(`Club with id ${id} not found`);
    }
    return club;
  }

  @Post()
  async create(@Body() body: CreateClubDto): Promise<ClubDocument> {
    return this.clubsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateClubDto
  ): Promise<ClubDocument> {
    const updated = await this.clubsService.update(id, body);
    if (!updated) {
      throw new NotFoundException(`Club with id ${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.clubsService.remove(id);
    return { success: true };
  }
}
