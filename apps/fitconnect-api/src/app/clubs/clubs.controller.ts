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
import { CreateClubDto } from './create-club.dto';
import { UpdateClubDto } from './update-club.dto';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  getAll(): Club[] {
    return this.clubsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Club {
    const club = this.clubsService.findOne(id);
    if (!club) {
      throw new NotFoundException(`Club with id ${id} not found`);
    }
    return club;
  }

  @Post()
  create(@Body() body: CreateClubDto): Club {
    return this.clubsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateClubDto): Club {
    const updated = this.clubsService.update(id, body);
    if (!updated) {
      throw new NotFoundException(`Club with id ${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.clubsService.remove(id);
    if (!success) {
      throw new NotFoundException(`Club with id ${id} not found`);
    }
    return { success };
  }
}
