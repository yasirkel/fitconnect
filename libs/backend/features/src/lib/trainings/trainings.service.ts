import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Training, TrainingDocument } from './training.schema';
import { Club, ClubDocument } from '../clubs/club.schema';
import { Enrollment, EnrollmentDocument } from '../enrollments/enrollment.schema';
import { CreateTrainingDto, UpdateTrainingDto } from '@fitconnect/dto';
import { Neo4jEnrollmentSyncService } from '@fitconnect/backend-neo4j';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,

    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>, 
    private readonly neoSync?: Neo4jEnrollmentSyncService,
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

  private async assertClubOwner(clubId: string, userId: string) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) throw new NotFoundException('Club not found');

    if ((club as any).ownerId !== userId) {
      throw new ForbiddenException('You can only manage trainings for your own club');
    }
  }

  async create(dto: CreateTrainingDto, userId: string): Promise<TrainingDocument> {
    await this.assertClubOwner(dto.clubId, userId);

    const created = await this.trainingModel.create({
      ...dto,
      clubId: new Types.ObjectId(dto.clubId),
    });

    try {
      if (this.neoSync) {
        await this.neoSync.upsertTraining({ trainingId: created._id.toString(), trainingTitle: created.title, clubId: dto.clubId });
      }
    } catch {
      // ignore
    }

    return created;
  }

  private async assertTrainingOwner(trainingId: string, userId: string) {
    const training = await this.trainingModel.findById(trainingId).exec();
    if (!training) throw new NotFoundException('Training not found');

    await this.assertClubOwner((training as any).clubId.toString(), userId);
    return training;
  }

  async update(id: string, dto: UpdateTrainingDto, userId: string): Promise<TrainingDocument> {
    await this.assertTrainingOwner(id, userId);

    const updated = await this.trainingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Training not found');
    try {
      if (this.neoSync) {
        await this.neoSync.upsertTraining({ trainingId: updated._id.toString(), trainingTitle: updated.title, clubId: (updated as any).clubId?.toString() });
      }
    } catch {
      // ignore
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<{ success: true }> {
    await this.assertTrainingOwner(id, userId);

    // Blokkeer delete als enrollments bestaan
    const enrollmentsExist = await this.enrollmentModel.exists({
      trainingId: new Types.ObjectId(id),
    });

    if (enrollmentsExist) {
      throw new BadRequestException('Cannot delete training: enrollments exist');
    }

    const deleted = await this.trainingModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Training not found');

    try {
      if (this.neoSync) {
        await this.neoSync.removeTraining({ trainingId: id });
      }
    } catch {
      // ignore
    }

    return { success: true };
  }
}
