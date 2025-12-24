import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Training, TrainingDocument } from './training.schema';
import { Club, ClubDocument } from '../clubs/club.schema';
import { CreateTrainingDto, UpdateTrainingDto } from '@fitconnect/dto';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,

    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
  ) {}

  async findAll(): Promise<TrainingDocument[]> {
    return this.trainingModel.find().exec();
  }

  async findOne(id: string): Promise<TrainingDocument> {
    const training = await this.trainingModel.findById(id).exec();
    if (!training) throw new NotFoundException('Training not found');
    return training;
  }

  async findByClubId(clubId: string): Promise<TrainingDocument[]> {
    return this.trainingModel
      .find({ clubId: new Types.ObjectId(clubId) })
      .exec();
  }

  // ownership check via club
  private async assertClubOwner(clubId: string, userId: string) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) throw new NotFoundException('Club not found');

    if ((club as any).ownerId !== userId) {
      throw new ForbiddenException(
        'You can only manage trainings for your own club',
      );
    }
  }

  async create(dto: CreateTrainingDto, userId: string): Promise<TrainingDocument> {
    await this.assertClubOwner(dto.clubId, userId);

    return this.trainingModel.create({
      ...dto,
      clubId: new Types.ObjectId(dto.clubId),
    });
  }

  private async assertTrainingOwner(trainingId: string, userId: string) {
    const training = await this.trainingModel.findById(trainingId).exec();
    if (!training) throw new NotFoundException('Training not found');

    await this.assertClubOwner(
      (training as any).clubId.toString(),
      userId,
    );

    return training;
  }

  async update(
    id: string,
    dto: UpdateTrainingDto,
    userId: string,
  ): Promise<TrainingDocument> {
    await this.assertTrainingOwner(id, userId);

    const updated = await this.trainingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Training not found');
    return updated;
  }

  async remove(id: string, userId: string): Promise<{ success: true }> {
    await this.assertTrainingOwner(id, userId);

    const deleted = await this.trainingModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Training not found');

    return { success: true };
  }
}
