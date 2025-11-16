// db.js
// Firebase Admin initialization and small helpers.

import admin from "firebase-admin";
import fs from "fs";

const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH; // optional
const FIREBASE_ADMIN_JSON = process.env.FIREBASE_ADMIN_JSON;   // optional (full JSON string)
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL; // e.g. https://...firebaseio.com

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
}

export function getDatabase() {
  initApp();
  return admin.database();
}

/**
 * Write final user decision object under users/{uid}
 * Structure:
 * users/{uid} = {
 *   prompt: string,
 *   scores: { "<option>": number, ... },
 *   result: string,
 *   timestamp: number
 * }
 */
export async function writeUserDecision(uid, { prompt, scores, result }) {
  const db = getDatabase();
  const ref = db.ref(`users/${uid}`);
  const payload = {
    prompt,
    scores,
    result,
    timestamp: Date.now(),
  };
  await ref.set(payload);
  return payload;
}

/** Generic helpers if needed */
export async function writePath(path, value) {
  const db = getDatabase();
  await db.ref(path).set(value);
}

export async function readPath(path) {
  const db = getDatabase();
  const snapshot = await db.ref(path).get();
  return snapshot.val();
}
