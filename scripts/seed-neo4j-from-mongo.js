const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const neo4j = require('neo4j-driver');

function loadEnv(path) {
  const data = fs.readFileSync(path, 'utf8');
  const lines = data.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

(async () => {
  const env = loadEnv('apps/fitconnect-api/.env');
  const mongoUri = env.MONGO_URI;
  const neoUri = env.NEO4J_URI;
  const neoUser = env.NEO4J_USER;
  const neoPass = env.NEO4J_PASSWORD;
  if (!mongoUri || !neoUri || !neoUser || !neoPass) {
    console.error('Missing MONGO or NEO4J env values');
    process.exit(2);
  }

  const mongo = new MongoClient(mongoUri);
  await mongo.connect();
  const db = mongo.db();

  // remove demo/sample nodes (ids that start with 'user-', 'training-' or 'club-')
  const driver = neo4j.driver(neoUri, neo4j.auth.basic(neoUser, neoPass));
  const session = driver.session();
  try {
    const demoCountRes = await session.run(
      "MATCH (n) WHERE n.id STARTS WITH 'user-' OR n.id STARTS WITH 'training-' OR n.id STARTS WITH 'club-' RETURN count(n) AS cnt"
    );
    const demoCount = demoCountRes.records && demoCountRes.records[0] ? demoCountRes.records[0].get('cnt').toNumber ? demoCountRes.records[0].get('cnt').toNumber() : demoCountRes.records[0].get('cnt') : 0;
    if (demoCount > 0) {
      console.log('Deleting demo nodes:', demoCount);
      await session.run(
        "MATCH (n) WHERE n.id STARTS WITH 'user-' OR n.id STARTS WITH 'training-' OR n.id STARTS WITH 'club-' DETACH DELETE n"
      );
    }
  } catch (err) {
    console.error('Error cleaning demo nodes', err);
  } finally {
    await session.close();
    await driver.close();
  }

  const enrollments = await db.collection('enrollments').find().toArray();
  console.log('Found enrollments:', enrollments.length);
  if (enrollments.length === 0) { await mongo.close(); process.exit(0); }

  // build user map (id -> email or name)
  const usersArray = await db.collection('users').find().toArray();
  const userMap = new Map();
  for (const u of usersArray) {
    const key = u._id ? u._id.toString() : u.id;
    const value = u.email || u.name || null;
    userMap.set(key, value);
  }

  const driver2 = neo4j.driver(neoUri, neo4j.auth.basic(neoUser, neoPass));
  const session2 = driver2.session();

  try {
    for (const e of enrollments) {
      const training = await db.collection('trainings').findOne({ _id: typeof e.trainingId === 'object' ? e.trainingId : new ObjectId(e.trainingId) });
      const club = training ? await db.collection('clubs').findOne({ _id: training.clubId }) : null;
      const userId = e.userId;

      const params = {
        userId: userId,
        userEmail: userMap.has(userId) ? userMap.get(userId) : null,
        trainingId: (training && training._id ? training._id : e.trainingId).toString(),
        trainingTitle: (training && training.title) ? training.title : null,
        clubId: club && club._id ? club._id.toString() : (training && training.clubId ? training.clubId.toString() : null),
        clubName: club && club.name ? club.name : null,
      };

      console.log('Upserting', params);
      await session2.run(`
        MERGE (u:User {id: $userId})
          ON CREATE SET u.email = $userEmail
          ON MATCH SET u.email = coalesce(u.email, $userEmail)

        MERGE (c:Club {id: $clubId})
          ON CREATE SET c.name = $clubName
          ON MATCH SET c.name = coalesce(c.name, $clubName)

        MERGE (t:Training {id: $trainingId})
          ON CREATE SET t.title = $trainingTitle
          ON MATCH SET t.title = coalesce(t.title, $trainingTitle)

        MERGE (t)-[:AT_CLUB]->(c)
        MERGE (u)-[:ENROLLED_IN]->(t)
      `, params);
    }
    console.log('Seed complete');
  } catch (err) {
    console.error('Seed error', err);
  } finally {
    await session2.close();
    await driver2.close();
    await mongo.close();
  }
})();
