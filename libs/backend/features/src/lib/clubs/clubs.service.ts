import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Club, ClubDocument } from './club.schema';
import { Training, TrainingDocument } from '../trainings/training.schema'; 
import { CreateClubDto, UpdateClubDto } from '@fitconnect/dto';
import { Neo4jEnrollmentSyncService } from '@fitconnect/backend-neo4j';

@Injectable()
export class ClubsService {
  constructor(
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,

    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument> 
    ,
    private readonly neoSync?: Neo4jEnrollmentSyncService,
  ) {}

  async findAll(): Promise<ClubDocument[]> {
    return this.clubModel.find().exec();
  }

  async findOne(id: string): Promise<ClubDocument> {
    const club = await this.clubModel.findById(id).exec();
    if (!club) throw new NotFoundException(`Club ${id} not found`);
    return club;
  }

  private async assertOwner(clubId: string, userId: string): Promise<ClubDocument> {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) throw new NotFoundException(`Club ${clubId} not found`);

    if ((club as any).ownerId !== userId) {
      throw new ForbiddenException('You can only modify your own club');
    }

    return club;
  }

  async create(data: CreateClubDto, ownerId: string): Promise<ClubDocument> {
    const created = await this.clubModel.create({
      ...data,
      ownerId,
    });
    try {
      if (this.neoSync) {
        await this.neoSync.upsertClub({ clubId: created._id.toString(), clubName: created.name });
      }
    } catch {
      // ignore
    }
    return created;
  }

  async update(id: string, changes: UpdateClubDto, userId: string): Promise<ClubDocument> {
    await this.assertOwner(id, userId);

    const updated = await this.clubModel
      .findByIdAndUpdate(id, changes, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Club ${id} not found`);
    try {
      if (this.neoSync) {
        await this.neoSync.upsertClub({ clubId: updated._id.toString(), clubName: updated.name });
      }
    } catch {
      // ignore
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<{ success: true }> {
    await this.assertOwner(id, userId);

    // blokkeer delete als er trainingen bestaan
    const trainingsExist = await this.trainingModel.exists({ clubId: id });
    if (trainingsExist) {
      throw new BadRequestException('Cannot delete club: trainings exist');
    }

    const res = await this.clubModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Club ${id} not found`);

    try {
      if (this.neoSync) {
        await this.neoSync.removeClub({ clubId: id });
      }
    } catch {
      // ignore
    }

    return { success: true };
  }
}
