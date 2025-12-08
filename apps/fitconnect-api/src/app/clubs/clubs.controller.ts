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

class CreateClubDto {
  name: string;
  address: string;
  city: string;
  description?: string;
  sportsOffered: string[];
  ownerId: string;
}

class UpdateClubDto {
  name?: string;
  address?: string;
  city?: string;
  description?: string;
  sportsOffered?: string[];
}

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
