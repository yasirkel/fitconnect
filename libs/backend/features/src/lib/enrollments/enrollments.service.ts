import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Enrollment } from './enrollment.schema';
import { CreateEnrollmentDto } from '@fitconnect/dto';
import { Training } from '../trainings/training.schema';
import { Club } from '../clubs/club.schema';
import { Neo4jEnrollmentSyncService } from '@fitconnect/backend-neo4j';
import { ForbiddenException } from '@nestjs/common';


@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,

    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>
    ,
    @InjectModel(Club.name)
    private readonly clubModel?: Model<Club>,
    private readonly neoSync?: Neo4jEnrollmentSyncService,
  ) {}

  // Haalt alle inschrijvingen op
  async findAll() {
    return this.enrollmentModel.find().exec();
  }

  // Schrijft een user in voor een training
  async enroll(trainingId: string, userId: string) {
  const trainingObjectId = new Types.ObjectId(trainingId);

  // Check of training bestaat
  const training = await this.trainingModel.findById(trainingObjectId).exec();
  if (!training) {
    throw new NotFoundException('Training not found');
  }

  // Voorkomt dubbele inschrijvingen
  const existing = await this.enrollmentModel
    .findOne({ trainingId: trainingObjectId, userId })
    .exec();

  if (existing) {
    throw new ConflictException('User already enrolled for this training');
  }

  // Kijkt of de training vol is
  const currentCount = await this.enrollmentModel
    .countDocuments({ trainingId: trainingObjectId })
    .exec();

  if (currentCount >= training.capacity) {
    throw new BadRequestException('Training is full');
  }

  // Schrijft de user in voor de training
  let created: any;
  try {
    created = await this.enrollmentModel.create({
      trainingId: trainingObjectId,
      userId,
    });
  } catch (error: any) {
    // Mongo duplicate key error (unique index)
    if (error?.code === 11000) {
      throw new ConflictException('User already enrolled for this training');
    }
    throw error;
  }

  // Sync to Neo4j (best-effort or rollback on failure)
  try {
    const clubId = (training as any).clubId?.toString();
    const club = clubId && this.clubModel ? await this.clubModel.findById(clubId).exec() : null;

    if (this.neoSync) {
      await this.neoSync.upsertEnrollmentGraph({
        userId,
        userEmail: undefined,
        trainingId: trainingId.toString(),
        trainingTitle: (training as any).title,
        clubId: clubId,
        clubName: club ? (club as any).name : undefined,
      });
    }
  } catch (e) {
    // rollback mongo insert to avoid desync
    try {
      await this.enrollmentModel.findByIdAndDelete(created._id).exec();
    } catch {
      /* ignore */
    }
    throw new ServiceUnavailableException('Neo4j sync failed');
  }

  return created;
}

// Verwijdert een inschrijving als de user de eigenaar is
async removeOwned(id: string, userId: string) {
  const enrollment = await this.enrollmentModel.findById(id).exec();
  if (!enrollment) throw new NotFoundException('Enrollment not found');

  if ((enrollment as any).userId !== userId) {
    throw new ForbiddenException('You can only delete your own enrollment');
  }

  await this.enrollmentModel.findByIdAndDelete(id).exec();

  // best-effort remove in Neo4j
  try {
    if (this.neoSync) {
      // enrollment may have trainingId as ObjectId
      await this.neoSync.removeEnrollmentGraph({
        userId,
        trainingId: (enrollment as any).trainingId.toString(),
      });
    }
  } catch {
    // ignore
  }

  return { success: true };
}


  // Haalt alle inschrijvingen op voor een specifieke training
  async findByTraining(trainingId: string) {
    return this.enrollmentModel
      .find({ trainingId: new Types.ObjectId(trainingId) })
      .exec();
  }

  // Haalt alle inschrijvingen op voor een specifieke user
  async findByUser(userId: string) {
    return this.enrollmentModel.find({ userId }).exec();
  }

  // Verwijdert een inschrijving
  async remove(id: string) {
    const deleted = await this.enrollmentModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Enrollment not found');
    }
    return { success: true };
  }
}
