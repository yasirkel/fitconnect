import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Training } from './training.schema';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(Training.name) private readonly trainingModel: Model<Training>
  ) {}

  async findAll(): Promise<Training[]> {
    return this.trainingModel.find().exec();
  }

  async findByClubId(clubId: string): Promise<Training[]> {
    return this.trainingModel.find({ clubId: new Types.ObjectId(clubId) }).exec();
  }

  async findOne(id: string): Promise<Training> {
    const training = await this.trainingModel.findById(id).exec();
    if (!training) throw new NotFoundException(`Training ${id} not found`);
    return training;
  }

  async create(dto: CreateTrainingDto): Promise<Training> {
    return this.trainingModel.create({
      ...dto,
      clubId: new Types.ObjectId(dto.clubId),
    });
  }

  async update(id: string, dto: UpdateTrainingDto): Promise<Training> {
    const updatePayload: any = { ...dto };
    if (dto.clubId) updatePayload.clubId = new Types.ObjectId(dto.clubId);

    const updated = await this.trainingModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Training ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.trainingModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Training ${id} not found`);
  }
}
