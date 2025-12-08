import { Test, TestingModule } from '@nestjs/testing';
import { ClubsService } from './clubs.service';
import { inject } from '@angular/core';
import { randomUUID } from 'crypto';
import { Club } from './club.model';

describe('ClubsService', () => {
  let service: ClubsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClubsService],
    }).compile();

    service = module.get<ClubsService>(ClubsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

@injectable()
export class ClubService {
  // Temporary in memory data store to test.
  private clubs: Club[] = [
    {
      id: randomUUID(),
      name: 'Fitcenter breda',
      address: 'stationstraat 10',
      city: 'Breda',
      description: 'A great place to work out',
      sportsOffered: ['yoga', 'pilates', 'weightlifting'],
      ownerId: randomUUID(),
      createdAt: new Date(),
    },
  ];

  findAll(): Club[] {
    return this.clubs;
  }

  findOne(id: string): Club | undefined {
    return this.clubs.find((club) => club.id === id);
  }

  create(data: Omit<Club, 'id' | 'createdAt'>): Club {
    const newClub: Club = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.clubs.push(newClub);
    return newClub;
  }

  update(
    id: string,
    data: Partial<Omit<Club, 'id' | 'createdAt'>>
  ): Club | undefined {
    const index = this.clubs.findIndex((club) => club.id === id);
    if (index === -1) return undefined;

    const existing = this.clubs[index];
    const updated: Club = { ...existing, ...data };
    this.clubs[index] = updated;
    return updated;
  }

  remove(id: string): boolean {
    const before = this.clubs.length;
    this.clubs = this.clubs.filter((club) => club.id !== id);
    return this.clubs.length < before;
  }
}

function injectable(): (
  target: typeof ClubService
) => void | typeof ClubService {
  throw new Error('Function not implemented.');
}
