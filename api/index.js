import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { v4 as uuidv4 } from "uuid";

// Cached Firebase app (Cloudflare functions are ephemeral)

const FIREBASE_ADMIN_JSON = context.env.FIREBASE_ADMIN_JSON;

let app;
function getFirebase() {
  if (!app) {
    app = initializeApp({
      credential: cert(JSON.parse(FIREBASE_ADMIN_JSON)),
      databaseURL: "https://decisionera-67322-default-rtdb.firebaseio.com/"
    });
  }
  return getDatabase();
}

export async function onRequestPost(context) {
  const db = getFirebase();

  const body = await context.request.json();

  const { prompt, score } = body;

  const userId = uuidv4();

  const resultExplanation =
    `Based on your input and score (${score.finalScore}), here is your personalized explanation...`;

  await db.ref(`users/${userId}`).set({
    prompt,
    score,
    result: resultExplanation,
    timestamp: Date.now()
  });

  return new Response(
    JSON.stringify({ userId, result: resultExplanation }),
    { headers: { "Content-Type": "application/json" } }
  );
}
