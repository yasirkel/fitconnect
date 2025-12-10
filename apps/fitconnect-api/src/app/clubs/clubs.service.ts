import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Club } from './club.model';
import { CreateClubDto } from './create-club.dto';
import { UpdateClubDto } from './update-club.dto';

@Injectable()
export class ClubsService {
  private clubs: Club[] = [
    {
      id: randomUUID(),
      name: 'FitCenter Breda',
      address: 'Stationsstraat 10',
      city: 'Breda',
      description: 'Moderne gym met groepslessen',
      sportsOffered: ['fitness', 'yoga'],
      ownerId: 'owner-1',
      createdAt: new Date(),
    },
  ];

  findAll(): Club[] {
    return this.clubs;
  }

  findOne(id: string): Club | undefined {
    return this.clubs.find((c) => c.id === id);
  }

  create(data: CreateClubDto): Club {
    const newClub: Club = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.clubs.push(newClub);
    return newClub;
  }

  update(id: string, changes: UpdateClubDto ): Club | undefined {
    const index = this.clubs.findIndex((club) => club.id === id);
    if (index === -1) return undefined;

    const existing = this.clubs[index];
    const updated: Club = { ...existing, ...changes };
    this.clubs[index] = updated;
    return updated;
  }

  remove(id: string): boolean {
    const before = this.clubs.length;
    this.clubs = this.clubs.filter((c) => c.id !== id);
    return this.clubs.length < before;
  }
}
