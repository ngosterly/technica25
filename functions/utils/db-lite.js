// functions/utils/db-lite.js
// Lightweight Firebase REST API wrapper for Cloudflare Workers
// Alternative to Firebase Admin SDK (no Node.js modules required)

/**
 * Write user decision to Firebase using REST API
 * @param {object} env - Environment variables
 * @param {string} uid - User ID
 * @param {object} data - Decision data
 */
export async function writeUserDecision(env, uid, data) {
  const dbUrl = env.FIREBASE_DB_URL;
  if (!dbUrl) {
    throw new Error("FIREBASE_DB_URL environment variable is required");
  }

  // Parse service account to get project info (for auth)
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(env.FIREBASE_ADMIN_JSON);
  } catch (err) {
    throw new Error("Failed to parse FIREBASE_ADMIN_JSON: " + err.message);
  }

  const payload = {
    prompt: data.prompt,
    options: data.options || [],
    categories: data.categories || [],
    weights: data.weights || {},
    scores: data.scores || {},
    result: data.result || "",
    timestamp: Date.now(),
  };

  // Use REST API to write data
  // Format: PUT to {dbUrl}/users/{uid}.json
  const url = `${dbUrl.replace(/\/$/, '')}/users/${uid}.json`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firebase write failed: ${error}`);
  }

  console.log(`✓ Saved decision for user ${uid.slice(0, 8)}...`);
  return payload;
}

/**
 * Read user decision from Firebase using REST API
 */
export async function readUserDecision(env, uid) {
  const dbUrl = env.FIREBASE_DB_URL;
  if (!dbUrl) {
    throw new Error("FIREBASE_DB_URL environment variable is required");
  }

  const url = `${dbUrl.replace(/\/$/, '')}/users/${uid}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Firebase read failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get all decisions (for admin/analytics)
 */
export async function getAllDecisions(env) {
  const dbUrl = env.FIREBASE_DB_URL;
  if (!dbUrl) {
    throw new Error("FIREBASE_DB_URL environment variable is required");
  }

  const url = `${dbUrl.replace(/\/$/, '')}/users.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Firebase read failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete user decision
 */
export async function deleteUserDecision(env, uid) {
  const dbUrl = env.FIREBASE_DB_URL;
  if (!dbUrl) {
    throw new Error("FIREBASE_DB_URL environment variable is required");
  }

  const url = `${dbUrl.replace(/\/$/, '')}/users/${uid}.json`;
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`Firebase delete failed: ${response.status}`);
  }

  console.log(`✓ Deleted decision for user ${uid}`);
}

/**
 * Generic helpers
 */
export async function writePath(env, path, value) {
  const dbUrl = env.FIREBASE_DB_URL;
  const url = `${dbUrl.replace(/\/$/, '')}/${path}.json`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });

  if (!response.ok) {
    throw new Error(`Firebase write failed: ${response.status}`);
  }
}

export async function readPath(env, path) {
  const dbUrl = env.FIREBASE_DB_URL;
  const url = `${dbUrl.replace(/\/$/, '')}/${path}.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Firebase read failed: ${response.status}`);
  }

  return await response.json();
}
