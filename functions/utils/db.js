// functions/utils/db.js
// Firebase Admin utilities for Cloudflare Workers

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

/**
 * Initialize Firebase Admin (singleton pattern)
 * In Cloudflare Workers, we need to pass credentials from environment
 */
export function initFirebase(env) {
  // Check if already initialized
  if (getApps().length > 0) {
    return;
  }

  // Parse service account from environment
  let serviceAccount;
  try {
    // Cloudflare stores secrets as strings
    serviceAccount = JSON.parse(env.FIREBASE_ADMIN_JSON);
  } catch (err) {
    throw new Error("Failed to parse FIREBASE_ADMIN_JSON: " + err.message);
  }

  if (!env.FIREBASE_DB_URL) {
    throw new Error("FIREBASE_DB_URL environment variable is required");
  }

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: env.FIREBASE_DB_URL,
  });

  console.log("✓ Firebase initialized");
}

/**
 * Write complete user decision to database
 * Structure at users/{uid}:
 * {
 *   prompt: string,
 *   options: string[],
 *   categories: string[],
 *   weights: { [category]: number },
 *   scores: { [option]: number },
 *   result: string,
 *   timestamp: number
 * }
 */
export async function writeUserDecision(env, uid, data) {
  initFirebase(env);
  const db = getDatabase();
  const ref = db.ref(`users/${uid}`);

  const payload = {
    prompt: data.prompt,
    options: data.options || [],
    categories: data.categories || [],
    weights: data.weights || {},
    scores: data.scores || {},
    result: data.result || "",
    timestamp: Date.now(),
  };

  await ref.set(payload);
  console.log(`✓ Saved decision for user ${uid.slice(0, 8)}...`);

  return payload;
}

/**
 * Read user decision from database
 */
export async function readUserDecision(env, uid) {
  initFirebase(env);
  const db = getDatabase();
  const snapshot = await db.ref(`users/${uid}`).get();
  return snapshot.val();
}

/**
 * Get all decisions (for admin/analytics)
 */
export async function getAllDecisions(env) {
  initFirebase(env);
  const db = getDatabase();
  const snapshot = await db.ref('users').get();
  return snapshot.val();
}

/**
 * Delete user decision
 */
export async function deleteUserDecision(env, uid) {
  initFirebase(env);
  const db = getDatabase();
  await db.ref(`users/${uid}`).remove();
  console.log(`✓ Deleted decision for user ${uid}`);
}

/**
 * Generic helpers
 */
export async function writePath(env, path, value) {
  initFirebase(env);
  const db = getDatabase();
  await db.ref(path).set(value);
}

export async function readPath(env, path) {
  initFirebase(env);
  const db = getDatabase();
  const snapshot = await db.ref(path).get();
  return snapshot.val();
}
