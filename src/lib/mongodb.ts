import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "myport";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}
const mongoUri = uri;

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as GlobalMongo;

export async function getDatabase() {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(mongoUri, {
      maxPoolSize: 10,
    }).connect();
  }

  const client = await globalForMongo._mongoClientPromise;
  return client.db(dbName);
}
