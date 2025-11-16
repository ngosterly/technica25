// db.js
import admin from "firebase-admin";
import fs from "fs";

// Load service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync("decisionera-67322-firebase-adminsdk-fbsvc-0e85f9d3bf.json")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://decisionera-67322-default-rtdb.firebaseio.com/",
  });
}

const database = admin.database();

/**
 * Write any data to the realtime database.
 * @param {string} path 
 * @param {any} value 
 */
export async function writeDB(path, value) {
  await database.ref(path).set(value);
}

/**
 * Read data from a given path.
 * @param {string} path 
 */
export async function readDB(path) {
  const snapshot = await database.ref(path).get();
  return snapshot.val();
}

/**
 * Set up a real-time listener.
 * @param {string} path 
 * @param {(data: any) => void} callback 
 */
export function listenDB(path, callback) {
  database.ref(path).on("value", (snapshot) => {
    callback(snapshot.val());
  });
}

// Debug run
if (process.argv[2] === "test") {
  await writeDB("users/user1", { name: "Brennen", score: 100 });
  const data = await readDB("users/user1");
  console.log("Read from DB:", data);
}
