// db.js
// Firebase Admin initialization and database helpers

import admin from "firebase-admin";
import fs from "fs";

const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH;
const FIREBASE_ADMIN_JSON = process.env.FIREBASE_ADMIN_JSON;
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL;

if (!FIREBASE_DB_URL) {
  throw new Error("Set FIREBASE_DB_URL env var to your realtime DB URL.");
}

let appInitialized = false;

function initApp() {
  if (appInitialized) return;

  let serviceAccount;
  if (FIREBASE_ADMIN_JSON) {
    serviceAccount = JSON.parse(FIREBASE_ADMIN_JSON);
  } else if (SERVICE_ACCOUNT_PATH) {
    const raw = fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8");
    serviceAccount = JSON.parse(raw);
  } else {
    throw new Error("Provide FIREBASE_ADMIN_JSON or SERVICE_ACCOUNT_PATH env var.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: FIREBASE_DB_URL,
  });

  appInitialized = true;
  console.log("✓ Firebase initialized");
}

export function getDatabase() {
  initApp();
  return admin.database();
}

/**
 * Write complete user decision to database
 * Structure at users/{uid}:
 * {
 *   prompt: string,
 *   options: string[],
 *   categories: string[],
 *   weights: { [category]: number },  // normalized weights
 *   scores: { [option]: number },      // final scores 0-100
 *   result: string,                    // AI explanation
 *   timestamp: number
 * }
 */
export async function writeUserDecision(uid, data) {
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
export async function readUserDecision(uid) {
  const db = getDatabase();
  const snapshot = await db.ref(`users/${uid}`).get();
  return snapshot.val();
}

/**
 * Get all decisions (for admin/analytics)
 */
export async function getAllDecisions() {
  const db = getDatabase();
  const snapshot = await db.ref('users').get();
  return snapshot.val();
}

/**
 * Delete user decision
 */
export async function deleteUserDecision(uid) {
  const db = getDatabase();
  await db.ref(`users/${uid}`).remove();
  console.log(`✓ Deleted decision for user ${uid}`);
}

/** Generic helpers */
export async function writePath(path, value) {
  const db = getDatabase();
  await db.ref(path).set(value);
}

export async function readPath(path) {
  const db = getDatabase();
  const snapshot = await db.ref(path).get();
  return snapshot.val();
}