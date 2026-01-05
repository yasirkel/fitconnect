const fs = require('fs');
const neo4j = require('neo4j-driver');

function loadEnv(path) {
  const data = fs.readFileSync(path, 'utf8');
  const lines = data.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) {
      env[m[1]] = m[2];
    }
  }
  return env;
}

async function main() {
  const envPath = 'apps/fitconnect-api/.env';
  if (!fs.existsSync(envPath)) {
    console.error('.env not found at', envPath);
    process.exit(2);
  }
  const env = loadEnv(envPath);
  const uri = env.NEO4J_URI;
  const user = env.NEO4J_USER;
  const password = env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    console.error('Missing neo4j env values', {uri,user,password});
    process.exit(2);
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  try {
    const resAll = await session.run('MATCH (n) RETURN count(n) AS cnt');
    const total = resAll.records[0].get('cnt').toNumber ? resAll.records[0].get('cnt').toNumber() : resAll.records[0].get('cnt');
    console.log('Total nodes:', total);

    const labels = ['User','Training','Club'];
    for (const label of labels) {
      const r = await session.run(`MATCH (:`+label+`) RETURN count(*) AS cnt`);
      const cnt = r.records[0].get('cnt').toNumber ? r.records[0].get('cnt').toNumber() : r.records[0].get('cnt');
      console.log(`${label}: ${cnt}`);
    }

    const rels = ['ENROLLED_IN','AT_CLUB'];
    for (const rel of rels) {
      const r = await session.run(`MATCH ()-[r:${rel}]-() RETURN count(r) AS cnt`);
      const cnt = r.records[0].get('cnt').toNumber ? r.records[0].get('cnt').toNumber() : r.records[0].get('cnt');
      console.log(`${rel}: ${cnt}`);
    }

    const sample = await session.run('MATCH (u:User)-[r:ENROLLED_IN]->(t:Training)-[s:AT_CLUB]->(c:Club) RETURN u,t,c LIMIT 5');
    console.log('Sample ENROLLED_IN rows:', sample.records.length);

  } catch (err) {
    console.error('Error querying neo4j:', err.message || err);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
