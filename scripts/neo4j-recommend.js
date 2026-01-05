const fs = require('fs');
const neo4j = require('neo4j-driver');
function loadEnv(path) { return fs.readFileSync(path,'utf8').split(/\r?\n/).reduce((acc,line)=>{const m=line.match(/^\s*([A-Z0-9_]+)=(.*)$/); if(m) acc[m[1]]=m[2]; return acc;},{});} 
(async ()=>{
  const env = loadEnv('apps/fitconnect-api/.env');
  const uri = env.NEO4J_URI, user = env.NEO4J_USER, pass = env.NEO4J_PASSWORD;
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, pass));
  const session = driver.session();
  const userId = process.argv[2] || '694bdc8ac5d518303f9a7fb4';
  try{
    const result = await session.run(`
      MATCH (me:User {id: $userId})-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(myClub:Club)
      MATCH (other:User)-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(myClub)
      WHERE other <> me
      MATCH (other)-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(rec:Club)
      WHERE NOT (me)-[:ENROLLED_IN]->(:Training)-[:AT_CLUB]->(rec)
      RETURN rec.id AS clubId, rec.name AS clubName, count(*) AS score
      ORDER BY score DESC
      LIMIT 5
    `, { userId });
    console.log('Recommendations for', userId);
    for(const r of result.records){
      console.log(r.get('clubId'), r.get('clubName'), r.get('score').toNumber ? r.get('score').toNumber() : r.get('score'));
    }
  }catch(e){console.error('err',e.message||e);} finally{await session.close(); await driver.close();}
})();