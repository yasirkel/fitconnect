import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment from app .env so `npx tsx` runs work without extra steps
dotenv.config({ path: 'apps/fitconnect-api/.env' });

import {
  UsersService,
  ClubsService,
  TrainingsService,
  EnrollmentsService,
} from '@fitconnect/features';

import { Neo4jService } from '@fitconnect/backend-neo4j';

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing in environment');
    process.exit(1);
  }
  if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
    console.error('NEO4J_* env vars missing');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const neo = app.get(Neo4jService);
    console.log('Clearing Neo4j database...');
    await neo.run('MATCH (n) DETACH DELETE n');

    // get models to reset collections (use string tokens to avoid runtime export issues)
    const userModel = app.get(getModelToken('User'));
    const clubModel = app.get(getModelToken('Club'));
    const trainingModel = app.get(getModelToken('Training'));
    const enrollmentModel = app.get(getModelToken('Enrollment'));

    console.log('Clearing Mongo collections...');
    await Promise.all([
      userModel.deleteMany({}),
      clubModel.deleteMany({}),
      trainingModel.deleteMany({}),
      enrollmentModel.deleteMany({}),
    ]);

    const usersService = app.get(UsersService);
    const clubsService = app.get(ClubsService);
    const trainingsService = app.get(TrainingsService);
    const enrollmentsService = app.get(EnrollmentsService);

    const plainPassword = 'Test1234!';

    // 5 realistic users
    const usersData = [
      { email: 'alice@fitconnect.nl', displayName: 'Alice van Dijk' },
      { email: 'bob@fitconnect.nl', displayName: 'Bob de Vries' },
      { email: 'carla@fitconnect.nl', displayName: 'Carla Jansen' },
      { email: 'daniel@fitconnect.nl', displayName: 'Daniel Bakker' },
      { email: 'elaine@fitconnect.nl', displayName: 'Elaine Pieters' },
    ];

    console.log('Seeding users...');
    const createdUsers: any[] = [];
    for (const u of usersData) {
      const hash = await bcrypt.hash(plainPassword, 10);
      const created = await usersService.create({ email: u.email, passwordHash: hash, displayName: u.displayName });
      createdUsers.push(created);
    }

    // 5 clubs with owners distributed over at least 3 users
    const clubDatas = [
      { name: 'Amsterdam Athletics', address: 'Damrak 1', city: 'Amsterdam', description: 'Olympic-style athletics club', sportsOffered: ['running','fitness'] },
      { name: 'Rotterdam Strength Lab', address: 'Coolsingel 10', city: 'Rotterdam', description: 'Strength and conditioning', sportsOffered: ['weightlifting','crossfit'] },
      { name: 'Utrecht Swim Club', address: 'Oudegracht 20', city: 'Utrecht', description: 'Competitive swimming and lessons', sportsOffered: ['swimming'] },
      { name: 'Eindhoven Cycle Center', address: 'Stratumseind 5', city: 'Eindhoven', description: 'Cycling coaching and routes', sportsOffered: ['cycling'] },
      { name: 'Groningen Yoga House', address: 'Vismarkt 3', city: 'Groningen', description: 'Yoga and mobility', sportsOffered: ['yoga'] },
    ];

    console.log('Seeding clubs...');
    const createdClubs: any[] = [];
    // assign owners: first three users own the clubs (distribute)
    for (let i = 0; i < clubDatas.length; i++) {
      const owner = createdUsers[i % 3];
      const created = await clubsService.create(clubDatas[i], owner._id.toString());
      createdClubs.push(created);
    }

    // 10 trainings (2 per club)
    console.log('Seeding trainings...');
    const createdTrainings: any[] = [];
    const now = Date.now();
    for (const club of createdClubs) {
      for (let t = 0; t < 2; t++) {
        const start = new Date(now + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000 + (t+1) * 60 * 60 * 1000);
        const dto: any = {
          clubId: club._id.toString(),
          title: `${club.name} - ${t === 0 ? 'Morning' : 'Evening'} Session`,
          description: `${club.name} training session`,
          startTime: start.toISOString(),
          durationMinutes: t === 0 ? 60 : 90,
          capacity: 10 + t * 5,
        };
        // create with owner of the club
        const ownerId = (club as any).ownerId ? (club as any).ownerId.toString() : createdUsers[0]._id.toString();
        const created = await trainingsService.create(dto, ownerId);
        createdTrainings.push(created);
      }
    }

    // 20 enrollments distributed with overlap
    console.log('Seeding enrollments...');
    const enrollmentsSet = new Set<string>();
    const maxAttempts = 200;
    let attempts = 0;
    while (enrollmentsSet.size < 20 && attempts < maxAttempts) {
      attempts++;
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const training = createdTrainings[Math.floor(Math.random() * createdTrainings.length)];
      const key = `${user._id.toString()}_${training._id.toString()}`;
      if (enrollmentsSet.has(key)) continue;
      try {
        await enrollmentsService.enroll(training._id.toString(), user._id.toString());
        enrollmentsSet.add(key);
      } catch (err) {
        // ignore conflicts or full trainings
      }
    }

    console.log('\nSeed complete. Test accounts:');
    for (const u of createdUsers) {
      console.log(`- ${u.email} : ${plainPassword}`);
    }

  } catch (err) {
    console.error('Seed error', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

run();
