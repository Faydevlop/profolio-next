import { MongoClient, Db } from "mongodb";
import { cookies } from "next/headers";

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _currentUri?: string;
};

const globalForMongo = globalThis as GlobalMongo;

let cachedMongoUri: string | null = null;

export function setCachedMongoUri(uri: string) {
  cachedMongoUri = uri;
  globalForMongo._currentUri = uri;
}

/**
 * Establishes a connection to MongoDB and returns the database instance.
 * Priority: 1. In-Memory Cache, 2. Cookie, 3. Environment Variable
 */
export async function getDatabase(): Promise<Db | null> {
  let uri = cachedMongoUri;

  // Next, try the cookie to override the .env
  if (!uri) {
    try {
      const cookieStore = await cookies();
      uri = cookieStore.get("SETUP_MONGO_URI")?.value || null;
    } catch (err) {
      // Ignored
    }
  }

  // Finally, fallback to the environment variable
  if (!uri) {
    uri = process.env.MONGODB_URI || null;
  }

  if (!uri) return null;

  // Set cache for subsequent calls
  cachedMongoUri = uri;

  // If we don't have a promise OR the URI changed, create a new connection
  if (!globalForMongo._mongoClientPromise || globalForMongo._currentUri !== uri) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
    globalForMongo._currentUri = uri;
  }

  const client = await globalForMongo._mongoClientPromise;

  // client.db() uses the database specified in the URI
  return client.db();
}

/**
 * Connects to a specific MongoDB URI dynamically.
 * Used during setup to verify and initialize a new database.
 */
export async function getDatabaseFromUri(uri: string): Promise<Db> {
  // We use a one-off client here to avoid polluting the global cache during setup
  const tempClient = new MongoClient(uri);
  const connectedClient = await tempClient.connect();
  return connectedClient.db();
}
