// Small script to register a temp user and POST a club to reproduce auth behavior
// Run with: node scripts/run-auth-test.js
const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  try {
    const base = 'http://localhost:3333/api';

    const registerRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `ai-test-${Date.now()}@example.com`,
        password: 'Password123!',
        displayName: 'AI Test'
      }),
    });

    const registerJson = await registerRes.json();
    console.log('REGISTER-STATUS', registerRes.status);
    console.log('REGISTER-BODY', registerJson);

    const token = registerJson?.token;
    if (!token) {
      console.error('No token returned from register; aborting');
      process.exit(1);
    }

    const clubRes = await fetch(`${base}/clubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'AI Club',
        address: 'AI Addr',
        city: 'AI City',
        description: 'Created by AI test',
        sportsOffered: [],
      }),
    });

    console.log('CLUB-STATUS', clubRes.status);
    try {
      const clubJson = await clubRes.json();
      console.log('CLUB-BODY', clubJson);
    } catch (e) {
      console.error('Failed to parse club response body', e.message);
    }
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
