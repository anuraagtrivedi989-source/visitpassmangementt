// utils/ensureEnv.js
// Simple runtime guard – aborts startup if required env vars are missing.

function ensureEnv(vars) {
  const missing = [];
  for (const v of vars) {
    if (!process.env[v] || process.env[v].trim() === '') {
      missing.push(v);
    }
  }
  if (missing.length) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

export default ensureEnv;

