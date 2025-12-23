import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ClubDocument } from './club.schema';
import { CreateClubDto, UpdateClubDto } from '@fitconnect/dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectModel(ClubDocument.name) private readonly clubModel: Model<ClubDocument>
  ) {}

  async findAll(): Promise<ClubDocument[]> {
    return this.clubModel.find().exec();
  }

  async findOne(id: string): Promise<ClubDocument> {
    const club = await this.clubModel.findById(id).exec();
    if (!club) throw new NotFoundException(`Club ${id} not found`);
    return club;
  }

  async create(data: CreateClubDto): Promise<ClubDocument> {
    const created = await this.clubModel.create(data);
    return created;
  }

  async update(id: string, changes: UpdateClubDto): Promise<ClubDocument> {
    const updated = await this.clubModel
      .findByIdAndUpdate(id, changes, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Club ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.clubModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Club ${id} not found`);
  }
}
