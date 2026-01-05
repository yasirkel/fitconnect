const fs = require('fs');
const neo4j = require('neo4j-driver');
const http = require('http');

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

async function queryNeo(session, q) {
  const res = await session.run(q);
  return res.records.map(r => {
    const obj = {};
    r.keys.forEach(k => {
      try { obj[k] = r.get(k); } catch (e) { obj[k] = r.get(k); }
    });
    return obj;
  });
}

function httpGetJson(url, token) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    opts.method = 'GET';
    opts.headers = headers;

    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c.toString());
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({status: res.statusCode, body: data}); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async function main(){
  const env = loadEnv('apps/fitconnect-api/.env');
  const uri = env.NEO4J_URI; const user = env.NEO4J_USER; const password = env.NEO4J_PASSWORD;
  if (!uri || !user || !password) { console.error('Missing NEO4J env'); process.exit(2); }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  try {
    console.log('--- Neo4j: Users ---');
    const users = await session.run('MATCH (u:User) RETURN u.id AS id, u.email AS email LIMIT 20');
    users.records.forEach(r => console.log(r.get('id'), r.get('email')));

    console.log('\n--- Neo4j: Trainings ---');
    const trainings = await session.run('MATCH (t:Training) RETURN t.id AS id, t.title AS title LIMIT 20');
    trainings.records.forEach(r => console.log(r.get('id'), r.get('title')));

    console.log('\n--- Neo4j: Clubs ---');
    const clubs = await session.run('MATCH (c:Club) RETURN c.id AS id, c.name AS name LIMIT 20');
    clubs.records.forEach(r => console.log(r.get('id'), r.get('name')));

    console.log('\n--- ENROLLED_IN relationships (raw) ---');
    const enr = await session.run('MATCH (u:User)-[r:ENROLLED_IN]->(t:Training) RETURN u.id AS uid, t.id AS tid LIMIT 20');
    enr.records.forEach(r => console.log('user', r.get('uid'), 'training', r.get('tid')));

    console.log('\n--- AT_CLUB relationships (raw) ---');
    const atc = await session.run('MATCH (t:Training)-[r:AT_CLUB]->(c:Club) RETURN t.id AS tid, c.id AS cid LIMIT 20');
    atc.records.forEach(r => console.log('training', r.get('tid'), 'club', r.get('cid')));

  } catch (err) {
    console.error('Neo4j query error', err.message||err);
  } finally {
    await session.close();
    await driver.close();
  }

  // fetch enrollments from API
  try {
    const token = process.env.TEST_TOKEN || 'aUcwT2OnuA83o3cej-I00eOFmZETuO7LQnMpQ5S0K7Y';
    const url = 'http://localhost:3333/api/enrollments';
    console.log('\n--- API: GET /api/enrollments ---');
    const res = await httpGetJson(url, token);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('API fetch error', err.message||err);
  }
})();
