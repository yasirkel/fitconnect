import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Club } from './club.model';

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

  create(data: Omit<Club, 'id' | 'createdAt'>): Club {
    const newClub: Club = {
      id: randomUUID(),
      createdAt: new Date(),
      ...data,
    };
    this.clubs.push(newClub);
    return newClub;
  }

  update(
    id: string,
    changes: Partial<Omit<Club, 'id' | 'createdAt'>>
  ): Club | undefined {
    const idx = this.clubs.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.clubs[idx] = { ...this.clubs[idx], ...changes };
    return this.clubs[idx];
  }

  remove(id: string): boolean {
    const before = this.clubs.length;
    this.clubs = this.clubs.filter((c) => c.id !== id);
    return this.clubs.length < before;
  }
}
