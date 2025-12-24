import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Club, ClubDocument } from './club.schema';
import { CreateClubDto, UpdateClubDto } from '@fitconnect/dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>
  ) {}

  async findAll(): Promise<ClubDocument[]> {
    return this.clubModel.find().exec();
  }

  async findOne(id: string): Promise<ClubDocument> {
    const club = await this.clubModel.findById(id).exec();
    if (!club) throw new NotFoundException(`Club ${id} not found`);
    return club;
  }

  // Helper to check ownership
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
    return created;
  }

  async update(id: string, changes: UpdateClubDto, userId: string): Promise<ClubDocument> {
    await this.assertOwner(id, userId);

    const updated = await this.clubModel
      .findByIdAndUpdate(id, changes, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Club ${id} not found`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<{ success: true }> {
    await this.assertOwner(id, userId);

    const res = await this.clubModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Club ${id} not found`);

    return { success: true };
  }
}
