import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import { Neo4jEnrollmentSyncService } from '@fitconnect/backend-neo4j';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly neoSync?: Neo4jEnrollmentSyncService,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
  }) {
    const created = await this.userModel.create(data);
    // best-effort sync to Neo4j (do not block user creation)
    try {
      if (this.neoSync) {
        await this.neoSync.upsertUser({ userId: created._id.toString(), email: created.email, displayName: created.displayName });
      }
    } catch {
      // ignore sync failures for now
    }
    return created;
  }
}
